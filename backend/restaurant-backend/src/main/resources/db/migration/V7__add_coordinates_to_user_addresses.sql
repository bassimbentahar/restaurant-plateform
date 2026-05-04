ALTER TABLE user_addresses
  ADD COLUMN latitude NUMERIC(10, 7),
  ADD COLUMN longitude NUMERIC(10, 7);

CREATE INDEX idx_user_addresses_coordinates
  ON user_addresses(latitude, longitude);
