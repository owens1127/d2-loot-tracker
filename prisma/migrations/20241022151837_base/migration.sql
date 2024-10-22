-- CreateTable
CREATE TABLE "weapon_rolls" (
    "item_instance_id" TEXT NOT NULL PRIMARY KEY,
    "destiny_membership_id" TEXT NOT NULL,
    "weapon_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barrel_1" TEXT NOT NULL,
    "barrel_2" TEXT,
    "magazine_1" TEXT NOT NULL,
    "magazine_2" TEXT,
    "left_trait_1" TEXT NOT NULL,
    "left_trait_2" TEXT,
    "left_trait_3" TEXT,
    "right_trait_1" TEXT NOT NULL,
    "right_trait_2" TEXT,
    "right_trait_3" TEXT,
    "masterwork" TEXT
);

-- CreateTable
CREATE TABLE "active_hashes" (
    "weapon_hash" TEXT NOT NULL PRIMARY KEY,
    "display_name" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "weapon_rolls_destiny_membership_id_idx" ON "weapon_rolls"("destiny_membership_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "weapon_rolls_weapon_hash_idx" ON "weapon_rolls"("weapon_hash", "created_at" DESC);

-- CreateIndex
CREATE INDEX "weapon_rolls_created_at_idx" ON "weapon_rolls"("created_at" DESC);
