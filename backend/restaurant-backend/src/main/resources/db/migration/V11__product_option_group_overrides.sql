ALTER TABLE product_option_groups
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

ALTER TABLE product_option_groups
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE product_option_groups
  ADD COLUMN IF NOT EXISTS required_override BOOLEAN;

ALTER TABLE product_option_groups
  ADD COLUMN IF NOT EXISTS min_select_override INTEGER;

ALTER TABLE product_option_groups
  ADD COLUMN IF NOT EXISTS max_select_override INTEGER;

ALTER TABLE product_option_groups
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

DO
$$
BEGIN
  IF
EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'product_option_groups_pkey'
      AND table_name = 'product_option_groups'
  ) THEN
ALTER TABLE product_option_groups DROP CONSTRAINT product_option_groups_pkey;
END IF;
END $$;

DO
$$
BEGIN
  IF
NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'pk_product_option_groups'
      AND table_name = 'product_option_groups'
  ) THEN
ALTER TABLE product_option_groups
  ADD CONSTRAINT pk_product_option_groups PRIMARY KEY (id);
END IF;
END $$;

DO
$$
BEGIN
  IF
NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'uk_product_option_groups_product_group'
      AND table_name = 'product_option_groups'
  ) THEN
ALTER TABLE product_option_groups
  ADD CONSTRAINT uk_product_option_groups_product_group UNIQUE (product_id, option_group_id);
END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_option_groups_product_id
  ON product_option_groups(product_id);

CREATE INDEX IF NOT EXISTS idx_product_option_groups_option_group_id
  ON product_option_groups(option_group_id);

CREATE INDEX IF NOT EXISTS idx_product_option_groups_product_display_order
  ON product_option_groups(product_id, display_order);
