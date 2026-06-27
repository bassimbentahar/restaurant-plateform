CREATE TABLE option_group_rules (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                  product_id UUID,
                                  variant_id UUID,
                                  option_group_id UUID NOT NULL,

                                  type VARCHAR(50) NOT NULL,
                                  name VARCHAR(120) NOT NULL,
                                  description TEXT,

                                  condition_json JSONB NOT NULL,
                                  action_json JSONB NOT NULL,

                                  priority INTEGER NOT NULL DEFAULT 0,
                                  is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  last_modified_date TIMESTAMP,
                                  created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                  last_modified_by VARCHAR(255),

                                  CONSTRAINT fk_option_group_rules_product
                                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

                                  CONSTRAINT fk_option_group_rules_variant
                                    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,

                                  CONSTRAINT fk_option_group_rules_option_group
                                    FOREIGN KEY (option_group_id) REFERENCES option_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_option_group_rules_product
  ON option_group_rules(product_id);

CREATE INDEX idx_option_group_rules_variant
  ON option_group_rules(variant_id);

CREATE INDEX idx_option_group_rules_option_group
  ON option_group_rules(option_group_id);

CREATE INDEX idx_option_group_rules_active_priority
  ON option_group_rules(is_active, priority);
