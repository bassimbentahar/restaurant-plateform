CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE categories (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(120) NOT NULL,
                          slug VARCHAR(120) NOT NULL,
                          CONSTRAINT uk_categories_name UNIQUE (name),
                          CONSTRAINT uk_categories_slug UNIQUE (slug)
);

CREATE TABLE products (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        sku VARCHAR(100) NOT NULL,
                        slug VARCHAR(100) NOT NULL,
                        title VARCHAR(150) NOT NULL,
                        short_description VARCHAR(255),
                        description TEXT,
                        thumb VARCHAR(500),
                        base_price NUMERIC(10, 2) NOT NULL,
                        is_available BOOLEAN NOT NULL DEFAULT TRUE,
                        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
                        is_archived BOOLEAN NOT NULL DEFAULT FALSE,
                        preparation_time_minutes INTEGER,
                        available_from TIME,
                        available_to TIME,
                        calories INTEGER,
                        ingredients_text TEXT,
                        allergens_text TEXT,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        category_id UUID,
                        CONSTRAINT uk_products_sku UNIQUE (sku),
                        CONSTRAINT uk_products_slug UNIQUE (slug),
                        CONSTRAINT fk_products_category FOREIGN KEY (category_id)
                          REFERENCES categories (id)
                          ON DELETE SET NULL,
                        CONSTRAINT chk_products_base_price_non_negative CHECK (base_price >= 0),
                        CONSTRAINT chk_products_preparation_time_non_negative CHECK (
                          preparation_time_minutes IS NULL OR preparation_time_minutes >= 0
                          ),
                        CONSTRAINT chk_products_calories_non_negative CHECK (
                          calories IS NULL OR calories >= 0
                          )
);

CREATE TABLE product_images (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              url VARCHAR(500) NOT NULL,
                              alt_text VARCHAR(255),
                              display_order INTEGER NOT NULL DEFAULT 0,
                              is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                              product_id UUID NOT NULL,
                              CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
                                REFERENCES products (id)
                                ON DELETE CASCADE,
                              CONSTRAINT chk_product_images_display_order_non_negative CHECK (display_order >= 0)
);

CREATE TABLE product_variants (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                name VARCHAR(120) NOT NULL,
                                sku VARCHAR(100),
                                price_adjustment NUMERIC(10, 2) NOT NULL DEFAULT 0,
                                is_default BOOLEAN NOT NULL DEFAULT FALSE,
                                is_available BOOLEAN NOT NULL DEFAULT TRUE,
                                display_order INTEGER NOT NULL DEFAULT 0,
                                product_id UUID NOT NULL,
                                CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id)
                                  REFERENCES products (id)
                                  ON DELETE CASCADE,
                                CONSTRAINT chk_product_variants_price_adjustment_min CHECK (price_adjustment >= -99999999.99),
                                CONSTRAINT chk_product_variants_display_order_non_negative CHECK (display_order >= 0)
);

CREATE TABLE option_groups (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             name VARCHAR(120) NOT NULL,
                             description VARCHAR(255),
                             min_selections INTEGER NOT NULL DEFAULT 0,
                             max_selections INTEGER NOT NULL DEFAULT 1,
                             required BOOLEAN NOT NULL DEFAULT FALSE,
                             is_available BOOLEAN NOT NULL DEFAULT TRUE,
                             display_order INTEGER NOT NULL DEFAULT 0,
                             CONSTRAINT chk_option_groups_min_selections_non_negative CHECK (min_selections >= 0),
                             CONSTRAINT chk_option_groups_max_selections_positive CHECK (max_selections >= 0),
                             CONSTRAINT chk_option_groups_selection_bounds CHECK (max_selections >= min_selections),
                             CONSTRAINT chk_option_groups_display_order_non_negative CHECK (display_order >= 0)
);

CREATE TABLE option_items (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name VARCHAR(120) NOT NULL,
                            description VARCHAR(255),
                            price_adjustment NUMERIC(10, 2) NOT NULL DEFAULT 0,
                            is_default BOOLEAN NOT NULL DEFAULT FALSE,
                            is_available BOOLEAN NOT NULL DEFAULT TRUE,
                            display_order INTEGER NOT NULL DEFAULT 0,
                            option_group_id UUID NOT NULL,
                            CONSTRAINT fk_option_items_option_group FOREIGN KEY (option_group_id)
                              REFERENCES option_groups (id)
                              ON DELETE CASCADE,
                            CONSTRAINT chk_option_items_price_adjustment_min CHECK (price_adjustment >= -99999999.99),
                            CONSTRAINT chk_option_items_display_order_non_negative CHECK (display_order >= 0)
);

CREATE TABLE product_option_groups (
                                     product_id UUID NOT NULL,
                                     option_group_id UUID NOT NULL,
                                     PRIMARY KEY (product_id, option_group_id),
                                     CONSTRAINT fk_product_option_groups_product FOREIGN KEY (product_id)
                                       REFERENCES products (id)
                                       ON DELETE CASCADE,
                                     CONSTRAINT fk_product_option_groups_option_group FOREIGN KEY (option_group_id)
                                       REFERENCES option_groups (id)
                                       ON DELETE CASCADE
);

CREATE INDEX idx_option_items_option_group_id ON option_items (option_group_id);
CREATE INDEX idx_option_items_group_display_order ON option_items (option_group_id, display_order);
CREATE INDEX idx_product_option_groups_option_group_id ON product_option_groups (option_group_id);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_is_available ON products (is_available);
CREATE INDEX idx_products_is_featured ON products (is_featured);
CREATE INDEX idx_products_is_archived ON products (is_archived);
CREATE INDEX idx_products_title ON products (title);
CREATE INDEX idx_product_option_groups_product_id ON product_option_groups (product_id);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_product_display_order ON product_images (product_id, display_order);
CREATE UNIQUE INDEX uq_product_images_primary_per_product
  ON product_images (product_id)
  WHERE is_primary = TRUE;

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_product_variants_product_display_order ON product_variants (product_id, display_order);
CREATE UNIQUE INDEX uq_product_variants_sku_not_null
  ON product_variants (sku)
  WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX uq_product_variants_default_per_product
  ON product_variants (product_id)
  WHERE is_default = TRUE;

CREATE INDEX idx_product_option_items_group_id ON option_items (option_group_id);
CREATE INDEX idx_product_option_items_group_display_order
  ON option_items (option_group_id, display_order);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
