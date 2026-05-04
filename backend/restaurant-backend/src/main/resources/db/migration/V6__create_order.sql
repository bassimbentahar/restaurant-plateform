CREATE TABLE orders (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      last_modified_date TIMESTAMP,
                      created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                      last_modified_by VARCHAR(255),

                      restaurant_id UUID NOT NULL,
                      user_id UUID NOT NULL,
                      address_id UUID,

                      order_number VARCHAR(255) NOT NULL UNIQUE,
                      order_type VARCHAR(30) NOT NULL,
                      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                      delivery_time_type VARCHAR(30) NOT NULL,
                      scheduled_date DATE,
                      scheduled_time TIME,

                      subtotal NUMERIC(10,2) NOT NULL,
                      service_fee NUMERIC(10,2) NOT NULL,
                      delivery_fee NUMERIC(10,2) NOT NULL,
                      total NUMERIC(10,2) NOT NULL,

                      customer_firstname VARCHAR(255) NOT NULL,
                      customer_lastname VARCHAR(255) NOT NULL,
                      customer_phone VARCHAR(255) NOT NULL,
                      note TEXT,

                      CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
                      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
                      CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES user_addresses(id)
);

CREATE TABLE order_items (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           last_modified_date TIMESTAMP,
                           created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                           last_modified_by VARCHAR(255),

                           order_id UUID NOT NULL,
                           product_id UUID NOT NULL,
                           product_name VARCHAR(255) NOT NULL,
                           variant_id UUID,
                           variant_name VARCHAR(255),
                           quantity INTEGER NOT NULL,

                           base_unit_price NUMERIC(10,2) NOT NULL,
                           unit_final_price NUMERIC(10,2) NOT NULL,
                           line_total_price NUMERIC(10,2) NOT NULL,
                           special_instructions TEXT,

                           CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                           CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
                           CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
                           CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
);

CREATE TABLE order_item_options (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  last_modified_date TIMESTAMP,
                                  created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                                  last_modified_by VARCHAR(255),

                                  order_item_id UUID NOT NULL,
                                  option_group_id UUID,
                                  option_group_name VARCHAR(255) NOT NULL,
                                  option_item_id UUID,
                                  option_name VARCHAR(255) NOT NULL,
                                  price_delta NUMERIC(10,2) NOT NULL DEFAULT 0,

                                  CONSTRAINT fk_order_item_options_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_order_item_options_group FOREIGN KEY (option_group_id) REFERENCES option_groups(id),
                                  CONSTRAINT fk_order_item_options_item FOREIGN KEY (option_item_id) REFERENCES option_items(id)
);
