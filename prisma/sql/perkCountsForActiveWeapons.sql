WITH weps AS (
    SELECT * 
    FROM weapon_rolls
    WHERE weapon_hash IN (SELECT weapon_hash FROM active_hashes)
),
unwrapped_barrels AS (
    SELECT weapon_hash, barrel_1 AS barrel FROM weps
    UNION ALL
    SELECT weapon_hash, barrel_2 AS barrel FROM weps WHERE barrel_2 IS NOT NULL
),
barrels AS (
    SELECT 
        weapon_hash AS weaponHash,
        CAST(barrel AS TEXT) AS perk, 
        'barrel' AS column, 
        COUNT(*) AS count
    FROM unwrapped_barrels
    GROUP BY weapon_hash, barrel
),
unwrapped_magazines AS (
    SELECT weapon_hash, magazine_1 AS magazine FROM weps
    UNION ALL
    SELECT weapon_hash, magazine_2 AS magazine FROM weps WHERE magazine_2 IS NOT NULL
),
magazines AS (
    SELECT 
        weapon_hash AS weaponHash, 
        CAST(magazine AS TEXT) AS perk, 
        'magazine' AS column, 
        COUNT(*) AS count
    FROM unwrapped_magazines
    GROUP BY weapon_hash, magazine
),
unwrapped_left_traits AS (
    SELECT weapon_hash, left_trait_1 AS left_trait FROM weps
    UNION ALL
    SELECT weapon_hash, left_trait_2 AS left_trait FROM weps WHERE left_trait_2 IS NOT NULL
    UNION ALL
    SELECT weapon_hash, left_trait_3 AS left_trait FROM weps WHERE left_trait_3 IS NOT NULL
),
left_traits AS (
    SELECT 
        weapon_hash AS weaponHash, 
        CAST(left_trait AS TEXT) AS perk, 
        'left_perk' AS column, 
        COUNT(*) AS count
    FROM unwrapped_left_traits
    GROUP BY weapon_hash, left_trait
),
unwrapped_right_traits AS (
    SELECT weapon_hash, right_trait_1 AS right_trait FROM weps
    UNION ALL
    SELECT weapon_hash, right_trait_2 AS right_trait FROM weps WHERE right_trait_2 IS NOT NULL
    UNION ALL
    SELECT weapon_hash, right_trait_3 AS right_trait FROM weps WHERE right_trait_3 IS NOT NULL
),
right_traits AS (
    SELECT 
        weapon_hash AS weaponHash, 
        CAST(right_trait AS TEXT) AS perk, 
        'right_perk' AS column, 
        COUNT(*) AS count
    FROM unwrapped_right_traits
    GROUP BY weapon_hash, right_trait
),
masterworks AS (
    SELECT 
        weapon_hash AS weaponHash, 
        CAST(masterwork AS TEXT) AS perk, 
        'masterwork' AS column, 
        COUNT(*) AS count
    FROM weps WHERE masterwork IS NOT NULL
    GROUP BY weapon_hash, masterwork
)
SELECT * FROM (
    SELECT * FROM barrels
    UNION ALL
    SELECT * FROM magazines
    UNION ALL
    SELECT * FROM left_traits
    UNION ALL
    SELECT * FROM right_traits
    UNION ALL
    SELECT * FROM masterworks
) AS combined