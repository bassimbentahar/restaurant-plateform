CREATE TABLE restaurant_rules (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

                                name VARCHAR(120) NOT NULL,
                                description TEXT,

                                rule_type VARCHAR(50) NOT NULL,

                                condition_json JSONB NOT NULL DEFAULT '{}'::jsonb,
                                action_json JSONB NOT NULL DEFAULT '{}'::jsonb,

                                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                                is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
                                is_reusable BOOLEAN NOT NULL DEFAULT TRUE,

                                customer_visible BOOLEAN NOT NULL DEFAULT FALSE,
                                customer_title VARCHAR(120),
                                customer_description TEXT,

                                internal_only BOOLEAN NOT NULL DEFAULT FALSE,

                                created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                last_modified_date TIMESTAMP,
                                created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                last_modified_by VARCHAR(255)
);

CREATE INDEX idx_restaurant_rules_restaurant
  ON restaurant_rules(restaurant_id);

CREATE INDEX idx_restaurant_rules_active
  ON restaurant_rules(restaurant_id, is_active);

CREATE INDEX idx_restaurant_rules_favorite
  ON restaurant_rules(restaurant_id, is_favorite);

CREATE INDEX idx_restaurant_rules_type
  ON restaurant_rules(restaurant_id, rule_type);

CREATE INDEX idx_restaurant_rules_condition_json
  ON restaurant_rules USING GIN (condition_json);

CREATE INDEX idx_restaurant_rules_action_json
  ON restaurant_rules USING GIN (action_json);

CREATE TABLE marketing_campaigns (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                   restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

                                   name VARCHAR(120) NOT NULL,
                                   description TEXT,

                                   starts_at TIMESTAMP,
                                   ends_at TIMESTAMP,

                                   is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                   customer_visible BOOLEAN NOT NULL DEFAULT TRUE,
                                   customer_title VARCHAR(120),
                                   customer_description TEXT,

                                   created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   last_modified_date TIMESTAMP,
                                   created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                   last_modified_by VARCHAR(255)
);

CREATE INDEX idx_marketing_campaigns_restaurant
  ON marketing_campaigns(restaurant_id);

CREATE INDEX idx_marketing_campaigns_active
  ON marketing_campaigns(restaurant_id, is_active);


CREATE TABLE restaurant_rule_assignments (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                           restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                                           rule_id UUID NOT NULL REFERENCES restaurant_rules(id) ON DELETE CASCADE,

                                           campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,

                                           target_type VARCHAR(50) NOT NULL,

                                           category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
                                           product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                                           variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
                                           option_group_id UUID REFERENCES option_groups(id) ON DELETE CASCADE,
                                           option_item_id UUID REFERENCES option_items(id) ON DELETE CASCADE,

                                           priority INTEGER NOT NULL DEFAULT 0,
                                           is_active BOOLEAN NOT NULL DEFAULT TRUE,

                                           starts_at TIMESTAMP,
                                           ends_at TIMESTAMP,

                                           condition_override_json JSONB,
                                           action_override_json JSONB,

                                           created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           last_modified_date TIMESTAMP,
                                           created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                           last_modified_by VARCHAR(255),

                                           CONSTRAINT chk_restaurant_rule_assignment_target CHECK (
                                             target_type = 'RESTAURANT'
                                               OR (target_type = 'CATEGORY' AND category_id IS NOT NULL)
                                               OR (target_type = 'PRODUCT' AND product_id IS NOT NULL)
                                               OR (target_type = 'VARIANT' AND variant_id IS NOT NULL)
                                               OR (target_type = 'OPTION_GROUP' AND option_group_id IS NOT NULL)
                                               OR (target_type = 'OPTION_ITEM' AND option_item_id IS NOT NULL)
                                             )
);

CREATE INDEX idx_rule_assignments_restaurant_active
  ON restaurant_rule_assignments(restaurant_id, is_active, priority);

CREATE INDEX idx_rule_assignments_rule
  ON restaurant_rule_assignments(rule_id);

CREATE INDEX idx_rule_assignments_campaign
  ON restaurant_rule_assignments(campaign_id);

CREATE INDEX idx_rule_assignments_category
  ON restaurant_rule_assignments(category_id);

CREATE INDEX idx_rule_assignments_product
  ON restaurant_rule_assignments(product_id);

CREATE INDEX idx_rule_assignments_variant
  ON restaurant_rule_assignments(variant_id);

CREATE INDEX idx_rule_assignments_option_group
  ON restaurant_rule_assignments(option_group_id);

CREATE INDEX idx_rule_assignments_option_item
  ON restaurant_rule_assignments(option_item_id);

CREATE TABLE rule_tags (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                         restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

                         name VARCHAR(80) NOT NULL,
                         color VARCHAR(30),

                         created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant_rule_tags (
                                    rule_id UUID NOT NULL REFERENCES restaurant_rules(id) ON DELETE CASCADE,
                                    tag_id UUID NOT NULL REFERENCES rule_tags(id) ON DELETE CASCADE,

                                    PRIMARY KEY (rule_id, tag_id)
);

CREATE INDEX idx_rule_tags_restaurant
  ON rule_tags(restaurant_id);
