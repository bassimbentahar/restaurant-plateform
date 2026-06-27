-- V9__variant_option_groups.sql

CREATE TABLE variant_option_groups (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                     created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     last_modified_date TIMESTAMP,
                                     created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                     last_modified_by VARCHAR(255),

                                     variant_id UUID NOT NULL,
                                     option_group_id UUID NOT NULL,
                                     display_order INTEGER NOT NULL DEFAULT 0,

                                     CONSTRAINT fk_variant_option_groups_variant
                                       FOREIGN KEY (variant_id)
                                         REFERENCES product_variants(id)
                                         ON DELETE CASCADE,

                                     CONSTRAINT fk_variant_option_groups_option_group
                                       FOREIGN KEY (option_group_id)
                                         REFERENCES option_groups(id)
                                         ON DELETE CASCADE,

                                     CONSTRAINT uk_variant_option_groups_variant_group
                                       UNIQUE (variant_id, option_group_id),

                                     CONSTRAINT chk_variant_option_groups_display_order_non_negative
                                       CHECK (display_order >= 0)
);

CREATE INDEX idx_variant_option_groups_variant_id
  ON variant_option_groups(variant_id);

CREATE INDEX idx_variant_option_groups_option_group_id
  ON variant_option_groups(option_group_id);

CREATE INDEX idx_variant_option_groups_variant_display_order
  ON variant_option_groups(variant_id, display_order);
