-- AlterTable: add a nullable self-referential parentId so a collection
-- can have sub-collections (e.g. "Songket and Tenun" -> "Songket
-- Palembang", "Songket Padang", ...). Existing collections are
-- unaffected — they simply have parentId = NULL (top-level) until you
-- assign a parent via the admin panel.
ALTER TABLE `collections` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `collections_parentId_idx` ON `collections`(`parentId`);

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `collections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
