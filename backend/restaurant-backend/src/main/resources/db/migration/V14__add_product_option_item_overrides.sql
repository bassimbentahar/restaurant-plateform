CREATE TABLE product_option_item_overrides (
                                             id UUID PRIMARY KEY,

                                             product_option_group_link_id UUID NOT NULL,
                                             option_item_id UUID NOT NULL,

                                             visible BOOLEAN NOT NULL DEFAULT TRUE,

                                             created_at TIMESTAMP,
                                             updated_at TIMESTAMP,

                                             CONSTRAINT fk_product_option_item_override_link
                                               FOREIGN KEY (product_option_group_link_id)
                                                 REFERENCES product_option_groups(id)
                                                 ON DELETE CASCADE,

                                             CONSTRAINT fk_product_option_item_override_item
                                               FOREIGN KEY (option_item_id)
                                                 REFERENCES option_items(id)
                                                 ON DELETE CASCADE,

                                             CONSTRAINT uk_product_option_item_override
                                               UNIQUE (product_option_group_link_id, option_item_id)
);

CREATE INDEX idx_product_option_item_override_link
  ON product_option_item_overrides(product_option_group_link_id);

CREATE INDEX idx_product_option_item_override_item
  ON product_option_item_overrides(option_item_id);
