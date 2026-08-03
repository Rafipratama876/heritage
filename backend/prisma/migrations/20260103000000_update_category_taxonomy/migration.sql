-- This migration replaces the old wood-furniture catalog taxonomy
-- (Furniture/Decoration/WoodCraft/Textile) with a new one (Batik,
-- Songket & Tenun, Kebaya, jewelry, bags, plates, accessories).
--
-- Existing product/collection rows use category values that don't exist
-- in the new enum, so the catalog tables are cleared first. Re-run
-- `npm run seed` (or `docker compose run --rm seed`) afterward to
-- populate the new catalog.

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM `cart_items`;
DELETE FROM `specifications`;
DELETE FROM `product_images`;
DELETE FROM `products`;
DELETE FROM `collections`;
SET FOREIGN_KEY_CHECKS = 1;

-- AlterTable
ALTER TABLE `products` MODIFY `category` ENUM('Batik', 'SongketTenun', 'Kebaya', 'AccessoriesJewelry', 'Bag', 'Jewelry', 'Plate', 'OtherAccessories') NOT NULL;
