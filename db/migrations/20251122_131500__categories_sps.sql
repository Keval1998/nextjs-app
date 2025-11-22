-- Add image and description fields to categories and create RPCs
-- SAFE: uses IF NOT EXISTS for columns where appropriate and CREATE OR REPLACE for functions

alter table categories
  add column if not exists image_url text,
  add column if not exists description text;

-- Search categories with pagination and optional search
create or replace function public.categories_search(p_limit int, p_offset int, p_search text)
returns setof categories as $$
  select * from categories
  where (p_search is null or p_search = '' or name ilike '%'||p_search||'%')
  order by created_at desc
  limit p_limit offset p_offset;
$$ language sql stable;

-- Create category
create or replace function public.categories_create(p_name text, p_image_url text default null, p_description text default null)
returns categories as $$
  insert into categories (name, image_url, description)
  values (p_name, nullif(p_image_url, ''), nullif(p_description, ''))
  returning *;
$$ language sql volatile;

-- Update category
create or replace function public.categories_update(p_id uuid, p_name text, p_image_url text, p_description text)
returns categories as $$
  update categories set
    name = coalesce(p_name, name),
    image_url = case when p_image_url is not null then nullif(p_image_url,'') else image_url end,
    description = case when p_description is not null then nullif(p_description,'') else description end
  where id = p_id
  returning *;
$$ language sql volatile;

-- Delete category (returns deleted id)
create or replace function public.categories_delete(p_id uuid)
returns uuid as $$
  delete from categories where id = p_id returning id;
$$ language sql volatile;

-- Vendors by category (distinct vendors that have items in the category)
create or replace function public.vendors_by_category(p_category_id uuid, p_limit int, p_offset int, p_search text)
returns setof vendors as $$
  select distinct v.*
  from vendors v
  join items i on i.vendor_id = v.id
  where i.category_id = p_category_id
    and (p_search is null or p_search = '' or v.name ilike '%'||p_search||'%')
  order by v.created_at desc
  limit p_limit offset p_offset;
$$ language sql stable;
