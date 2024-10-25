-- @param {String} $1:weapon_hash
-- @param {String} $2:destiny_membership_id
-- @param {String} $3:item_instance_id
-- @param {String} $4:barrel_1
-- @param $5:barrel_2
-- @param {String} $6:magazine_1
-- @param $7:magazine_2
-- @param {String} $8:left_trait_1
-- @param $9:left_trait_2
-- @param $10:left_trait_3
-- @param {String} $11:right_trait_1
-- @param $12:right_trait_2
-- @param $13:right_trait_3
-- @param $14:masterwork

INSERT INTO weapon_rolls (
  weapon_hash,
  destiny_membership_id,
  item_instance_id,
  barrel_1,
  barrel_2,
  magazine_1,
  magazine_2,
  left_trait_1,
  left_trait_2,
  left_trait_3,
  right_trait_1,
  right_trait_2,
  right_trait_3,
  masterwork
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
ON CONFLICT(item_instance_id) DO NOTHING
RETURNING *;