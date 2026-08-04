-- CreateTable
CREATE TABLE `product_events` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `type` ENUM('VIEW', 'WA_CLICK', 'SHARE') NOT NULL,
    `visitorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_events_productId_idx`(`productId`),
    INDEX `product_events_type_idx`(`type`),
    INDEX `product_events_visitorId_idx`(`visitorId`),
    INDEX `product_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_events` ADD CONSTRAINT `product_events_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
