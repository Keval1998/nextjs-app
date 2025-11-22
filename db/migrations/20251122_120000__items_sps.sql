-- Stored procedures for items: search and insert

-- items_search(p_limit int, p_offset int, p_search text)
CREATE OR REPLACE FUNCTION public.items_search(
  p_limit integer,
  p_offset integer,
  p_search text
)
RETURNS SETOF public.items
LANGUAGE sql
AS $$
SELECT * FROM public.items i
WHERE (
  p_search IS NULL
  OR p_search = ''
  OR i.name ILIKE ('%' || p_search || '%')
  OR coalesce(i.description, '') ILIKE ('%' || p_search || '%')
)
ORDER BY i.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$;

-- items_insert(p_name text, p_price numeric, p_image_url text)
CREATE OR REPLACE FUNCTION public.items_insert(
  p_name text,
  p_price numeric,
  p_image_url text
)
RETURNS TABLE(id uuid, name text, price numeric, image_url text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.items (id, name, price, image_url, created_at)
  VALUES (v_id, p_name, p_price, p_image_url, now());

  RETURN QUERY SELECT i.id, i.name, i.price, i.image_url FROM public.items i WHERE i.id = v_id;
END;
$$;
