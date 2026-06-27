-- ============================================================
-- Mock category for product wizard tests
-- ============================================================

INSERT INTO categories (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  slug
)
VALUES (
         '20000000-0000-0000-0000-000000000001',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Tacos',
         'tacos'
       )
  ON CONFLICT (restaurant_id, slug) DO NOTHING;
