ALTER TABLE variant_option_groups
  ADD COLUMN required_override BOOLEAN;

ALTER TABLE variant_option_groups
  ADD COLUMN min_select_override INTEGER;

ALTER TABLE variant_option_groups
  ADD COLUMN max_select_override INTEGER;

ALTER TABLE variant_option_groups
  ADD CONSTRAINT chk_variant_option_groups_min_override_non_negative
    CHECK (min_select_override IS NULL OR min_select_override >= 0);

ALTER TABLE variant_option_groups
  ADD CONSTRAINT chk_variant_option_groups_max_override_non_negative
    CHECK (max_select_override IS NULL OR max_select_override >= 0);

ALTER TABLE variant_option_groups
  ADD CONSTRAINT chk_variant_option_groups_min_max_override
    CHECK (
      min_select_override IS NULL
        OR max_select_override IS NULL
        OR min_select_override <= max_select_override
      );
