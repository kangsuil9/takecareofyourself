begin;

-- RLS limits updates to the row owner. Column privileges additionally prevent
-- authenticated clients from changing ownership, timestamps, or image URLs.
revoke update on table public.care_logs from authenticated;
grant update (category, content, deleted_at) on table public.care_logs to authenticated;

commit;
