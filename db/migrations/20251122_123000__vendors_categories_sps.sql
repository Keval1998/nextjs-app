-- Stored procedures for vendors and categories

-- vendors_search(p_limit int, p_offset int, p_search text)
CREATE OR REPLACE FUNCTION public.vendors_search(
  p_limit integer,
  p_offset integer,
  p_search text
)
RETURNS SETOF public.vendors
LANGUAGE sql
AS $$
SELECT * FROM public.vendors v
WHERE (
  p_search IS NULL
  OR p_search = ''
  OR v.name ILIKE ('%' || p_search || '%')
  OR coalesce(v.address, '') ILIKE ('%' || p_search || '%')
)
ORDER BY v.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$;

-- categories_search(p_limit int, p_offset int, p_search text)
CREATE OR REPLACE FUNCTION public.categories_search(
  p_limit integer,
  p_offset integer,
  p_search text
)
RETURNS SETOF public.categories
LANGUAGE sql
AS $$
SELECT * FROM public.categories c
WHERE (
  p_search IS NULL
  OR p_search = ''
  OR c.name ILIKE ('%' || p_search || '%')
)
ORDER BY c.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$;
