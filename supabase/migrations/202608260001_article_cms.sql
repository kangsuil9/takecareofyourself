begin;

alter table public.articles
  add column content_blocks jsonb not null default '[]'::jsonb,
  add column references jsonb not null default '[]'::jsonb;

alter table public.articles
  alter column title set default '',
  alter column category set default '',
  alter column summary set default '',
  alter column content set default '';

alter table public.articles drop constraint if exists articles_title_check;
alter table public.articles drop constraint if exists articles_category_check;
alter table public.articles drop constraint if exists articles_summary_check;
alter table public.articles drop constraint if exists articles_content_check;

update public.articles
set content_blocks = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'type', 'paragraph',
    'segments', jsonb_build_array(jsonb_build_object('text', content))
  )
)
where content_blocks = '[]'::jsonb and char_length(btrim(content)) > 0;

alter table public.articles
  add constraint articles_content_blocks_array_check check (jsonb_typeof(content_blocks) = 'array'),
  add constraint articles_references_array_check check (jsonb_typeof(references) = 'array'),
  add constraint articles_published_required_fields_check check (
    status <> 'PUBLISHED'
    or (
      char_length(btrim(title)) > 0
      and char_length(btrim(category)) > 0
      and jsonb_array_length(content_blocks) > 0
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "article_images_authenticated_select_published_or_admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'article-images'
  and (
    (select public.is_admin())
    or exists (
      select 1
      from public.articles a
      where a.status = 'PUBLISHED'
        and (
          a.cover_image_url = name
          or exists (
            select 1 from jsonb_array_elements(a.content_blocks) block
            where block->>'type' = 'image' and block->>'path' = name
          )
        )
    )
  )
);

create policy "article_images_admin_insert_own_path"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-images'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (
    select u.id::text from public.users u where u.auth_user_id = (select auth.uid())
  )
);

create policy "article_images_admin_update_own_path"
on storage.objects for update to authenticated
using (
  bucket_id = 'article-images'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (
    select u.id::text from public.users u where u.auth_user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'article-images'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (
    select u.id::text from public.users u where u.auth_user_id = (select auth.uid())
  )
);

create policy "article_images_admin_delete_own_path"
on storage.objects for delete to authenticated
using (
  bucket_id = 'article-images'
  and (select public.is_admin())
  and (storage.foldername(name))[1] = (
    select u.id::text from public.users u where u.auth_user_id = (select auth.uid())
  )
);

commit;
