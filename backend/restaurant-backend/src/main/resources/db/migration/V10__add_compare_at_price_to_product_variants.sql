ALTER TABLE product_variants
  ADD COLUMN compare_at_price NUMERIC(10, 2);

ALTER TABLE product_variants
  ADD CONSTRAINT chk_product_variants_compare_at_price_non_negative
    CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
