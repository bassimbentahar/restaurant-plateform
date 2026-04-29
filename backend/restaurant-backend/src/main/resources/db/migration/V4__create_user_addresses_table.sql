CREATE TABLE user_addresses (
                              id UUID PRIMARY KEY,

                              user_id UUID NOT NULL,

                              label VARCHAR(255) NOT NULL,
                              street VARCHAR(255) NOT NULL,
                              street_number VARCHAR(255),
                              postal_code VARCHAR(255) NOT NULL,
                              city VARCHAR(255) NOT NULL,
                              country VARCHAR(255) DEFAULT 'Switzerland',
                              instructions VARCHAR(255),
                              default_address BOOLEAN NOT NULL DEFAULT FALSE,

                              created_date TIMESTAMP NOT NULL,
                              last_modified_date TIMESTAMP,
                              created_by VARCHAR(255) NOT NULL,
                              last_modified_by VARCHAR(255),

                              CONSTRAINT fk_user_addresses_user
                                FOREIGN KEY (user_id)
                                  REFERENCES users(id)
                                  ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id
  ON user_addresses(user_id);
