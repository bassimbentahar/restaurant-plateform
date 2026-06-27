-- ============================================================
-- V15__seed_option_groups_test_data.sql
-- Mock option groups for product wizard tests
-- ============================================================

-- Restaurant mock existant dans tes migrations
-- Miam's Restaurant
-- 01000000-0000-0000-0000-000000000001

-- ============================================================
-- Safety: ensure mock restaurant exists
-- ============================================================

INSERT INTO restaurants (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  slug,
  description,
  city,
  country,
  is_active,
  is_open,
  supports_delivery,
  supports_pickup
)
VALUES (
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Miam''s Restaurant',
         'miams-restaurant',
         'Restaurant tacos et snacks.',
         'Lausanne',
         'Switzerland',
         TRUE,
         TRUE,
         TRUE,
         TRUE
       )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Option group: Sauces
-- ============================================================

INSERT INTO option_groups (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES (
         '10000000-0000-0000-0000-000000000001',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Sauces',
         'Sauces classiques réutilisables dans plusieurs produits.',
         0,
         4,
         FALSE,
         TRUE,
         0
       )
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  (
    '11000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    'system',
    'system',
    'Mayo',
    NULL,
    0.00,
    FALSE,
    TRUE,
    0,
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    'system',
    'system',
    'Ketchup',
    NULL,
    0.00,
    FALSE,
    TRUE,
    1,
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '11000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    'system',
    'system',
    'Algérienne',
    NULL,
    0.00,
    FALSE,
    TRUE,
    2,
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '11000000-0000-0000-0000-000000000004',
    NOW(),
    NOW(),
    'system',
    'system',
    'Cheddar',
    NULL,
    1.00,
    FALSE,
    TRUE,
    3,
    '10000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Option group: Boissons
-- ============================================================

INSERT INTO option_groups (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES (
         '10000000-0000-0000-0000-000000000002',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Boissons',
         'Boissons utilisées pour les menus et formules.',
         0,
         1,
         FALSE,
         TRUE,
         1
       )
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  (
    '12000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    'system',
    'system',
    'Coca-Cola',
    NULL,
    0.00,
    FALSE,
    TRUE,
    0,
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '12000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    'system',
    'system',
    'Ice Tea',
    NULL,
    0.00,
    FALSE,
    TRUE,
    1,
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '12000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    'system',
    'system',
    'Eau',
    NULL,
    0.00,
    FALSE,
    TRUE,
    2,
    '10000000-0000-0000-0000-000000000002'
  )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Option group: Suppléments
-- ============================================================

INSERT INTO option_groups (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES (
         '10000000-0000-0000-0000-000000000003',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Suppléments',
         'Suppléments payants ou gratuits.',
         0,
         3,
         FALSE,
         TRUE,
         2
       )
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  (
    '13000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    'system',
    'system',
    'Fromage',
    NULL,
    1.00,
    FALSE,
    TRUE,
    0,
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    '13000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    'system',
    'system',
    'Extra viande',
    NULL,
    2.50,
    FALSE,
    TRUE,
    1,
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    '13000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    'system',
    'system',
    'Bacon',
    NULL,
    2.00,
    FALSE,
    TRUE,
    2,
    '10000000-0000-0000-0000-000000000003'
  )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Option group: Cuisson
-- ============================================================

INSERT INTO option_groups (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES (
         '10000000-0000-0000-0000-000000000004',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Cuisson',
         'Choix du niveau de cuisson.',
         1,
         1,
         TRUE,
         TRUE,
         3
       )
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  (
    '14000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    'system',
    'system',
    'Normal',
    NULL,
    0.00,
    TRUE,
    TRUE,
    0,
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    '14000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    'system',
    'system',
    'Bien cuit',
    NULL,
    0.00,
    FALSE,
    TRUE,
    1,
    '10000000-0000-0000-0000-000000000004'
  )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Option group: Niveau de piquant
-- ============================================================

INSERT INTO option_groups (
  id,
  restaurant_id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  min_selections,
  max_selections,
  required,
  is_available,
  display_order
)
VALUES (
         '10000000-0000-0000-0000-000000000005',
         '01000000-0000-0000-0000-000000000001',
         NOW(),
         NOW(),
         'system',
         'system',
         'Niveau de piquant',
         'Choix du niveau de piquant.',
         0,
         1,
         FALSE,
         TRUE,
         4
       )
  ON CONFLICT (id) DO NOTHING;

INSERT INTO option_items (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  name,
  description,
  price_adjustment,
  is_default,
  is_available,
  display_order,
  option_group_id
)
VALUES
  (
    '15000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    'system',
    'system',
    'Non piquant',
    NULL,
    0.00,
    TRUE,
    TRUE,
    0,
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    '15000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    'system',
    'system',
    'Piquant',
    NULL,
    0.00,
    FALSE,
    TRUE,
    1,
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    '15000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    'system',
    'system',
    'Très piquant',
    NULL,
    0.00,
    FALSE,
    TRUE,
    2,
    '10000000-0000-0000-0000-000000000005'
  )
  ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- Verification helper
-- ============================================================

-- SELECT id, restaurant_id, name, min_selections, max_selections, required, is_available
-- FROM option_groups
-- ORDER BY display_order;

-- SELECT id, option_group_id, name, price_adjustment, is_default, is_available, display_order
-- FROM option_items
-- ORDER BY option_group_id, display_order;
