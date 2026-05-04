CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Restaurants
-- ============================================================
CREATE TABLE restaurants (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           last_modified_date TIMESTAMP,
                           created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                           last_modified_by VARCHAR(255),

                           name VARCHAR(150) NOT NULL,
                           slug VARCHAR(150) NOT NULL UNIQUE,
                           description TEXT,
                           phone VARCHAR(50),
                           email VARCHAR(255),

                           street VARCHAR(255),
                           street_number VARCHAR(50),
                           postal_code VARCHAR(50),
                           city VARCHAR(120),
                           country VARCHAR(120) DEFAULT 'Switzerland',

                           latitude NUMERIC(10, 7),
                           longitude NUMERIC(10, 7),

                           is_active BOOLEAN NOT NULL DEFAULT TRUE,
                           is_open BOOLEAN NOT NULL DEFAULT TRUE,
                           supports_delivery BOOLEAN NOT NULL DEFAULT TRUE,
                           supports_pickup BOOLEAN NOT NULL DEFAULT TRUE,

                           average_rating NUMERIC(2, 1) DEFAULT 0,
                           total_reviews INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_city ON restaurants(city);

-- Restaurant par défaut pour rattacher les données existantes
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
  latitude,
  longitude,
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
         46.5197000,
         6.6323000,
         TRUE,
         TRUE,
         TRUE,
         TRUE
       )
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Rattacher categories / products / option_groups au restaurant
-- ============================================================
ALTER TABLE categories
  ADD COLUMN restaurant_id UUID;

UPDATE categories
SET restaurant_id = '01000000-0000-0000-0000-000000000001'
WHERE restaurant_id IS NULL;

ALTER TABLE categories
  ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE categories
  ADD CONSTRAINT fk_categories_restaurant
    FOREIGN KEY (restaurant_id)
      REFERENCES restaurants(id)
      ON DELETE CASCADE;

ALTER TABLE products
  ADD COLUMN restaurant_id UUID;

UPDATE products
SET restaurant_id = '01000000-0000-0000-0000-000000000001'
WHERE restaurant_id IS NULL;

ALTER TABLE products
  ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE products
  ADD CONSTRAINT fk_products_restaurant
    FOREIGN KEY (restaurant_id)
      REFERENCES restaurants(id)
      ON DELETE CASCADE;

ALTER TABLE option_groups
  ADD COLUMN restaurant_id UUID;

UPDATE option_groups
SET restaurant_id = '01000000-0000-0000-0000-000000000001'
WHERE restaurant_id IS NULL;

ALTER TABLE option_groups
  ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE option_groups
  ADD CONSTRAINT fk_option_groups_restaurant
    FOREIGN KEY (restaurant_id)
      REFERENCES restaurants(id)
      ON DELETE CASCADE;

-- ============================================================
-- Remplacer les contraintes uniques globales par restaurant
-- ============================================================

ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_categories_name;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_categories_slug;

ALTER TABLE products DROP CONSTRAINT IF EXISTS uk_products_sku;
ALTER TABLE products DROP CONSTRAINT IF EXISTS uk_products_slug;

ALTER TABLE categories
  ADD CONSTRAINT uk_categories_restaurant_slug UNIQUE (restaurant_id, slug);

ALTER TABLE categories
  ADD CONSTRAINT uk_categories_restaurant_name UNIQUE (restaurant_id, name);

ALTER TABLE products
  ADD CONSTRAINT uk_products_restaurant_sku UNIQUE (restaurant_id, sku);

ALTER TABLE products
  ADD CONSTRAINT uk_products_restaurant_slug UNIQUE (restaurant_id, slug);

CREATE INDEX idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX idx_option_groups_restaurant_id ON option_groups(restaurant_id);

-- ============================================================
-- Horaires restaurant
-- ============================================================
CREATE TABLE restaurant_opening_hours (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        last_modified_date TIMESTAMP,
                                        created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                        last_modified_by VARCHAR(255),

                                        restaurant_id UUID NOT NULL,
                                        day_of_week VARCHAR(20) NOT NULL,
                                        open_time TIME NOT NULL,
                                        close_time TIME NOT NULL,
                                        delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                        pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                        closed BOOLEAN NOT NULL DEFAULT FALSE,

                                        CONSTRAINT fk_opening_hours_restaurant
                                          FOREIGN KEY (restaurant_id)
                                            REFERENCES restaurants(id)
                                            ON DELETE CASCADE,

                                        CONSTRAINT uk_opening_hours_restaurant_day_time
                                          UNIQUE (restaurant_id, day_of_week, open_time, close_time)
);

CREATE INDEX idx_opening_hours_restaurant_id
  ON restaurant_opening_hours(restaurant_id);

INSERT INTO restaurant_opening_hours (
  id, created_date, last_modified_date, created_by, last_modified_by,
  restaurant_id, day_of_week, open_time, close_time,
  delivery_enabled, pickup_enabled, closed
)
VALUES
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'MONDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'MONDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'TUESDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'TUESDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'WEDNESDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'WEDNESDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'THURSDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'THURSDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'FRIDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'FRIDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'SATURDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'SATURDAY', '18:00', '22:00', TRUE, TRUE, FALSE),

  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'SUNDAY', '11:00', '14:00', TRUE, TRUE, FALSE),
  (gen_random_uuid(), NOW(), NOW(), 'system', 'system', '01000000-0000-0000-0000-000000000001', 'SUNDAY', '18:00', '22:00', TRUE, TRUE, FALSE)
  ON CONFLICT (restaurant_id, day_of_week, open_time, close_time) DO NOTHING;
-- ============================================================
-- Exceptions horaires
-- ============================================================
CREATE TABLE restaurant_exception_hours (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                          last_modified_date TIMESTAMP,
                                          created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                          last_modified_by VARCHAR(255),

                                          restaurant_id UUID NOT NULL,
                                          exception_date DATE NOT NULL,
                                          open_time TIME,
                                          close_time TIME,
                                          delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                          pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                          closed BOOLEAN NOT NULL DEFAULT FALSE,
                                          reason VARCHAR(255),

                                          CONSTRAINT fk_exception_hours_restaurant
                                            FOREIGN KEY (restaurant_id)
                                              REFERENCES restaurants(id)
                                              ON DELETE CASCADE,

                                          CONSTRAINT uk_exception_restaurant_date
                                            UNIQUE (restaurant_id, exception_date)
);

CREATE INDEX idx_exception_hours_restaurant_id
  ON restaurant_exception_hours(restaurant_id);

-- ============================================================
-- Fulfillment settings
-- ============================================================
CREATE TABLE restaurant_fulfillment_settings (
                                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                               created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                               last_modified_date TIMESTAMP,
                                               created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                               last_modified_by VARCHAR(255),

                                               restaurant_id UUID NOT NULL UNIQUE,

                                               delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                               pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                               preparation_minutes INTEGER NOT NULL DEFAULT 20,
                                               delivery_minutes INTEGER NOT NULL DEFAULT 20,
                                               slot_interval_minutes INTEGER NOT NULL DEFAULT 15,
                                               max_orders_per_slot INTEGER NOT NULL DEFAULT 5,
                                               asap_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                               scheduled_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                                               days_ahead INTEGER NOT NULL DEFAULT 5,

                                               CONSTRAINT fk_fulfillment_restaurant
                                                 FOREIGN KEY (restaurant_id)
                                                   REFERENCES restaurants(id)
                                                   ON DELETE CASCADE
);

INSERT INTO restaurant_fulfillment_settings (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  restaurant_id,
  delivery_enabled,
  pickup_enabled,
  preparation_minutes,
  delivery_minutes,
  slot_interval_minutes,
  max_orders_per_slot,
  asap_enabled,
  scheduled_enabled,
  days_ahead
)
VALUES (
         gen_random_uuid(),
         NOW(),
         NOW(),
         'system',
         'system',
         '01000000-0000-0000-0000-000000000001',
         TRUE,
         TRUE,
         20,
         20,
         15,
         5,
         TRUE,
         TRUE,
         5
       )
  ON CONFLICT (restaurant_id) DO NOTHING;

-- ============================================================
-- Slot overrides
-- ============================================================
CREATE TABLE restaurant_slot_overrides (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         last_modified_date TIMESTAMP,
                                         created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                         last_modified_by VARCHAR(255),

                                         restaurant_id UUID NOT NULL,
                                         slot_date DATE NOT NULL,
                                         slot_time TIME NOT NULL,
                                         order_type VARCHAR(30) NOT NULL,
                                         disabled BOOLEAN NOT NULL DEFAULT FALSE,
                                         max_orders INTEGER,
                                         reason VARCHAR(255),

                                         CONSTRAINT fk_slot_overrides_restaurant
                                           FOREIGN KEY (restaurant_id)
                                             REFERENCES restaurants(id)
                                             ON DELETE CASCADE,

                                         CONSTRAINT uk_slot_override_restaurant_date_time_type
                                           UNIQUE (restaurant_id, slot_date, slot_time, order_type)
);

CREATE INDEX idx_slot_overrides_restaurant_date
  ON restaurant_slot_overrides(restaurant_id, slot_date);

-- ============================================================
-- Delivery zones avec polygon PostGIS
-- ============================================================
CREATE TABLE delivery_zones (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              last_modified_date TIMESTAMP,
                              created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                              last_modified_by VARCHAR(255),

                              restaurant_id UUID NOT NULL,
                              name VARCHAR(120) NOT NULL,
                              delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
                              min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
                              enabled BOOLEAN NOT NULL DEFAULT TRUE,
                              area geometry(Polygon, 4326) NOT NULL,

                              CONSTRAINT fk_delivery_zones_restaurant
                                FOREIGN KEY (restaurant_id)
                                  REFERENCES restaurants(id)
                                  ON DELETE CASCADE
);

CREATE INDEX idx_delivery_zones_restaurant_id
  ON delivery_zones(restaurant_id);

CREATE INDEX idx_delivery_zones_area
  ON delivery_zones
  USING GIST (area);

INSERT INTO delivery_zones (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  restaurant_id,
  name,
  delivery_fee,
  min_order_amount,
  enabled,
  area
)
VALUES (
         gen_random_uuid(),
         NOW(),
         NOW(),
         'system',
         'system',
         '01000000-0000-0000-0000-000000000001',
         'Lausanne centre',
         4.50,
         20.00,
         TRUE,
         ST_GeomFromText(
           'POLYGON((6.6000 46.5000, 6.6700 46.5000, 6.6700 46.5500, 6.6000 46.5500, 6.6000 46.5000))',
           4326
         )
       );
