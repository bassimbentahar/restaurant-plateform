ALTER TABLE variant_option_groups
  ADD COLUMN IF NOT EXISTS included_selections_override INTEGER;

ALTER TABLE variant_option_groups
  ADD CONSTRAINT chk_variant_option_groups_included_selections_override_non_negative
    CHECK (
      included_selections_override IS NULL
        OR included_selections_override >= 0
      );
