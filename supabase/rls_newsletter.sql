-- Enable RLS
alter table "subscribers" enable row level security;

-- 1. Allow public to insert (Sign up form)
create policy "Enable insert for public" on "subscribers"
for insert with check (true);

-- 2. Allow admins to do everything (View, Delete, Update)
create policy "Enable full access for admins" on "subscribers"
for all using (
  auth.uid() in (select id from profiles where role = 'admin')
);
