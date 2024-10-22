-- CreateTable
CREATE TABLE "weapon_rolls" (
    "item_instance_id" TEXT NOT NULL PRIMARY KEY,
    "destiny_membership_id" BIGINT NOT NULL,
    "weapon_hash" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barrel_1" BIGINT NOT NULL,
    "barrel_2" BIGINT,
    "magazine_1" BIGINT NOT NULL,
    "magazine_2" BIGINT,
    "left_trait_1" BIGINT NOT NULL,
    "left_trait_2" BIGINT,
    "left_trait_3" BIGINT,
    "right_trait_1" BIGINT NOT NULL,
    "right_trait_2" BIGINT,
    "right_trait_3" BIGINT,
    "masterwork" TEXT,
    CONSTRAINT "weapon_rolls_weapon_hash_fkey" FOREIGN KEY ("weapon_hash") REFERENCES "active_hashes" ("weapon_hash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "active_hashes" (
    "weapon_hash" BIGINT NOT NULL PRIMARY KEY,
    "display_name" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "weapon_rolls_destiny_membership_id_idx" ON "weapon_rolls"("destiny_membership_id");

-- CreateIndex
CREATE INDEX "weapon_rolls_weapon_hash_idx" ON "weapon_rolls"("weapon_hash");

-- CreateIndex
CREATE INDEX "weapon_rolls_createdAt_idx" ON "weapon_rolls"("createdAt");
