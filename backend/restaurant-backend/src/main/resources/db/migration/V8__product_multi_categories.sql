-- V8__product_multi_categories.sql

-- ============================================================
-- Product multi-categories
-- ============================================================

CREATE TABLE product_categories (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  last_modified_date TIMESTAMP,
                                  created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                  last_modified_by VARCHAR(255),

                                  product_id UUID NOT NULL,
                                  category_id UUID NOT NULL,
                                  display_order INTEGER NOT NULL DEFAULT 0,

                                  CONSTRAINT fk_product_categories_product
                                    FOREIGN KEY (product_id)
                                      REFERENCES products(id)
                                      ON DELETE CASCADE,

                                  CONSTRAINT fk_product_categories_category
                                    FOREIGN KEY (category_id)
                                      REFERENCES categories(id)
                                      ON DELETE CASCADE,

                                  CONSTRAINT uk_product_categories_product_category
                                    UNIQUE (product_id, category_id),

                                  CONSTRAINT chk_product_categories_display_order_non_negative
                                    CHECK (display_order >= 0)
);

-- Migrer les anciennes relations products.category_id vers product_categories
INSERT INTO product_categories (
  id,
  created_date,
  last_modified_date,
  created_by,
  last_modified_by,
  product_id,
  category_id,
  display_order
)
SELECT
  gen_random_uuid(),
  NOW(),
  NOW(),
  'system',
  'system',
  p.id,
  p.category_id,
  0
FROM products p
WHERE p.category_id IS NOT NULL
  ON CONFLICT (product_id, category_id) DO NOTHING;

-- Indexes
CREATE INDEX idx_product_categories_product_id
  ON product_categories(product_id);

CREATE INDEX idx_product_categories_category_id
  ON product_categories(category_id);

CREATE INDEX idx_product_categories_category_display_order
  ON product_categories(category_id, display_order);

-- Supprimer l’ancien lien 1 produit = 1 catégorie
ALTER TABLE products
DROP CONSTRAINT IF EXISTS fk_products_category;

DROP INDEX IF EXISTS idx_products_category_id;

ALTER TABLE products
DROP COLUMN IF EXISTS category_id;
