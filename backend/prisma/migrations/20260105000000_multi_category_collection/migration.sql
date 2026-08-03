-- Products move from a single category + single collection to
-- many-to-many on both, via join tables. Existing product rows can't be
-- safely carried over into the new structure automatically, so the
-- catalog (and anything referencing it: cart/wishlist items, images,
-- specs) is cleared here — re-run `npm run seed` /
-- `docker compose run --rm seed` afterward to repopulate it.

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `cart_items`;
DELETE FROM `wishlist_items`;
DELETE FROM `specifications`;
DELETE FROM `product_images`;
DELETE FROM `products`;
SET FOREIGN_KEY_CHECKS = 1;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_collectionId_fkey`;

-- DropIndex
DROP INDEX `products_collectionId_idx` ON `products`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `collectionId`, DROP COLUMN `category`;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `category` ENUM('Batik', 'SongketTenun', 'Kebaya', 'AccessoriesJewelry', 'Bag', 'Jewelry', 'Plate', 'OtherAccessories') NOT NULL,

    INDEX `product_categories_productId_idx`(`productId`),
    UNIQUE INDEX `product_categories_productId_category_key`(`productId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_collections` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `collectionId` VARCHAR(191) NOT NULL,

    INDEX `product_collections_productId_idx`(`productId`),
    INDEX `product_collections_collectionId_idx`(`collectionId`),
    UNIQUE INDEX `product_collections_productId_collectionId_key`(`productId`, `collectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_collections` ADD CONSTRAINT `product_collections_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_collections` ADD CONSTRAINT `product_collections_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
