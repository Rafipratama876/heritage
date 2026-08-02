-- AlterTable: track when a user last logged in and was last seen
-- (heartbeat-updated while browsing, used for "online now").
ALTER TABLE `users` ADD COLUMN `lastLoginAt` DATETIME(3) NULL;
ALTER TABLE `users` ADD COLUMN `lastSeenAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `login_events` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_events_userId_idx`(`userId`),
    INDEX `login_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `login_events` ADD CONSTRAINT `login_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
