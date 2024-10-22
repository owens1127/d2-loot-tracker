/*
  Warnings:

  - The primary key for the `active_hashes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_active_hashes" (
    "weapon_hash" TEXT NOT NULL PRIMARY KEY,
    "display_name" TEXT NOT NULL
);
INSERT INTO "new_active_hashes" ("display_name", "weapon_hash") SELECT "display_name", "weapon_hash" FROM "active_hashes";
DROP TABLE "active_hashes";
ALTER TABLE "new_active_hashes" RENAME TO "active_hashes";
CREATE TABLE "new_weapon_rolls" (
    "item_instance_id" TEXT NOT NULL PRIMARY KEY,
    "destiny_membership_id" TEXT NOT NULL,
    "weapon_hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "masterwork" TEXT,
    CONSTRAINT "weapon_rolls_weapon_hash_fkey" FOREIGN KEY ("weapon_hash") REFERENCES "active_hashes" ("weapon_hash") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_weapon_rolls" ("barrel_1", "barrel_2", "createdAt", "destiny_membership_id", "item_instance_id", "left_trait_1", "left_trait_2", "left_trait_3", "magazine_1", "magazine_2", "masterwork", "right_trait_1", "right_trait_2", "right_trait_3", "weapon_hash") SELECT "barrel_1", "barrel_2", "createdAt", "destiny_membership_id", "item_instance_id", "left_trait_1", "left_trait_2", "left_trait_3", "magazine_1", "magazine_2", "masterwork", "right_trait_1", "right_trait_2", "right_trait_3", "weapon_hash" FROM "weapon_rolls";
DROP TABLE "weapon_rolls";
ALTER TABLE "new_weapon_rolls" RENAME TO "weapon_rolls";
CREATE INDEX "weapon_rolls_destiny_membership_id_idx" ON "weapon_rolls"("destiny_membership_id");
CREATE INDEX "weapon_rolls_weapon_hash_idx" ON "weapon_rolls"("weapon_hash");
CREATE INDEX "weapon_rolls_createdAt_idx" ON "weapon_rolls"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
