-- Update items_search to accept category and vendor filters and require category on insert
create or replace function public.items_search(
  p_limit integer,
  p_offset integer,
  p_search text,
  p_category uuid default null,
  p_vendor uuid default null
)
returns setof public.items
language sql
as $$
SELECT * FROM public.items i
WHERE (
  (p_category IS NULL OR i.category_id = p_category)
  AND (p_vendor IS NULL OR i.vendor_id = p_vendor)
  AND (
    p_search IS NULL
    OR p_search = ''
    OR i.name ILIKE ('%' || p_search || '%')
    OR coalesce(i.description, '') ILIKE ('%' || p_search || '%')
  )
)
ORDER BY i.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$;

-- Replace items_insert to require vendor_id and category_id
create or replace function public.items_insert(
  p_name text,
  p_price numeric,
  p_image_url text,
  p_vendor_id uuid,
  p_category_id uuid,
  p_description text default null,
  p_stock integer default 0
)
returns table(id uuid, name text, price numeric, image_url text, vendor_id uuid, category_id uuid)
language plpgsql
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  if p_category_id is null then
    raise exception 'category_id is required';
  end if;
  if p_vendor_id is null then
    raise exception 'vendor_id is required';
  end if;

  insert into public.items (id, name, price, image_url, vendor_id, category_id, description, stock, created_at)
  values (v_id, p_name, p_price, p_image_url, p_vendor_id, p_category_id, p_description, p_stock, now());

  return query select i.id, i.name, i.price, i.image_url, i.vendor_id, i.category_id from public.items i where i.id = v_id;
end;
$$;
