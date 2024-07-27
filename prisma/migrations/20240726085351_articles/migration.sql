-- CreateTable
CREATE TABLE `articles` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `contents` VARCHAR(191) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `is_published` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;
