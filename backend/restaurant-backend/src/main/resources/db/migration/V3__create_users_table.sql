-- V3__create_users_table.sql

CREATE TABLE users (
                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                     created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     last_modified_date TIMESTAMP,
                     created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                     last_modified_by VARCHAR(255),

                     keycloak_id VARCHAR(255) NOT NULL,
                     email VARCHAR(255) NOT NULL,
                     firstname VARCHAR(255) NOT NULL,
                     lastname VARCHAR(255) NOT NULL,
                     date_of_birth DATE,
                     phone VARCHAR(255),
                     enabled BOOLEAN NOT NULL DEFAULT TRUE,
                     deleted BOOLEAN NOT NULL DEFAULT FALSE,

                     CONSTRAINT uk_users_keycloak_id UNIQUE (keycloak_id),
                     CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_keycloak_id ON users (keycloak_id);
CREATE INDEX idx_users_enabled ON users (enabled);
CREATE INDEX idx_users_deleted ON users (deleted);
