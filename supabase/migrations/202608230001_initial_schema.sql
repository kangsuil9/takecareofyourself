begin;

create extension if not exists pgcrypto;

create type public.user_role as enum ('USER', 'ADMIN');
create type public.article_status as enum ('DRAFT', 'PUBLISHED');
create type public.notification_status as enum ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null default 'kakao' check (provider = 'kakao'),
  provider_user_id text not null,
  nickname text check (nickname is null or char_length(btrim(nickname)) between 2 and 20),
  role public.user_role not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create table public.care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text,
  content text not null check (char_length(btrim(content)) > 0),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  care_log_id uuid not null references public.care_logs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, care_log_id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) > 0),
  category text not null check (char_length(btrim(category)) > 0),
  summary text not null check (char_length(btrim(summary)) > 0),
  content text not null check (char_length(btrim(content)) > 0),
  cover_image_url text,
  reading_time integer check (reading_time is null or reading_time > 0),
  status public.article_status not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'PUBLISHED' or published_at is not null)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0),
  body text not null check (char_length(btrim(body)) > 0),
  scheduled_at timestamptz,
  sent_at timestamptz,
  status public.notification_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  check (status <> 'SCHEDULED' or scheduled_at is not null),
  check (status <> 'SENT' or sent_at is not null)
);

create index care_logs_user_created_idx on public.care_logs (user_id, created_at desc);
create index care_logs_public_feed_idx on public.care_logs (created_at desc) where deleted_at is null;
create index likes_care_log_idx on public.likes (care_log_id);
create index articles_public_idx on public.articles (published_at desc) where status = 'PUBLISHED';
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index notifications_schedule_idx on public.notifications (scheduled_at) where status = 'SCHEDULED';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger care_logs_set_updated_at before update on public.care_logs
for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions
for each row execute function public.set_updated_at();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where auth_user_id = (select auth.uid()) and role = 'ADMIN'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create function public.get_feed_profiles(profile_ids uuid[])
returns table (id uuid, nickname text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.nickname
  from public.users u
  where u.id = any(profile_ids)
    and u.nickname is not null
    and exists (
      select 1 from public.care_logs c
      where c.user_id = u.id and c.deleted_at is null
    );
$$;

revoke all on function public.get_feed_profiles(uuid[]) from public;
grant execute on function public.get_feed_profiles(uuid[]) to authenticated;

alter table public.users enable row level security;
alter table public.care_logs enable row level security;
alter table public.likes enable row level security;
alter table public.articles enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notifications enable row level security;

revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
grant update (nickname) on table public.users to authenticated;

create policy "users_select_own_or_admin" on public.users
for select to authenticated
using (auth_user_id = (select auth.uid()) or (select public.is_admin()));

create policy "users_update_own" on public.users
for update to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

revoke all on table public.care_logs from anon, authenticated;
grant select, insert, update on table public.care_logs to authenticated;

create policy "care_logs_select_active" on public.care_logs
for select to authenticated
using (deleted_at is null or (select public.is_admin()));

create policy "care_logs_insert_own" on public.care_logs
for insert to authenticated
with check (user_id = (select id from public.users where auth_user_id = (select auth.uid())));

create policy "care_logs_update_own" on public.care_logs
for update to authenticated
using (user_id = (select id from public.users where auth_user_id = (select auth.uid())))
with check (user_id = (select id from public.users where auth_user_id = (select auth.uid())));

revoke all on table public.likes from anon, authenticated;
grant select, insert, delete on table public.likes to authenticated;

create policy "likes_select_authenticated" on public.likes
for select to authenticated
using (exists (select 1 from public.care_logs where id = care_log_id and deleted_at is null));
create policy "likes_insert_own" on public.likes
for insert to authenticated
with check (
  user_id = (select id from public.users where auth_user_id = (select auth.uid()))
  and exists (select 1 from public.care_logs where id = care_log_id and deleted_at is null)
);
create policy "likes_delete_own" on public.likes
for delete to authenticated
using (user_id = (select id from public.users where auth_user_id = (select auth.uid())));

revoke all on table public.articles from anon, authenticated;
grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated;

create policy "articles_select_published" on public.articles
for select to anon, authenticated
using (status = 'PUBLISHED');
create policy "articles_select_admin" on public.articles
for select to authenticated
using ((select public.is_admin()));
create policy "articles_insert_admin" on public.articles
for insert to authenticated with check ((select public.is_admin()));
create policy "articles_update_admin" on public.articles
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "articles_delete_admin" on public.articles
for delete to authenticated using ((select public.is_admin()));

revoke all on table public.push_subscriptions from anon, authenticated;
grant select, insert, delete on table public.push_subscriptions to authenticated;

create policy "push_subscriptions_select_own" on public.push_subscriptions
for select to authenticated
using (user_id = (select id from public.users where auth_user_id = (select auth.uid())));
create policy "push_subscriptions_insert_own" on public.push_subscriptions
for insert to authenticated
with check (user_id = (select id from public.users where auth_user_id = (select auth.uid())));
create policy "push_subscriptions_delete_own" on public.push_subscriptions
for delete to authenticated
using (user_id = (select id from public.users where auth_user_id = (select auth.uid())));

revoke all on table public.notifications from anon, authenticated;
grant select, insert, update, delete on table public.notifications to authenticated;

create policy "notifications_select_admin" on public.notifications
for select to authenticated using ((select public.is_admin()));
create policy "notifications_insert_admin" on public.notifications
for insert to authenticated with check ((select public.is_admin()));
create policy "notifications_update_admin" on public.notifications
for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "notifications_delete_admin" on public.notifications
for delete to authenticated using ((select public.is_admin()));

commit;
