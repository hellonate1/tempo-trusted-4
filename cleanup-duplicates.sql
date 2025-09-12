-- Script to clean up duplicate products
-- This will merge reviews from duplicate products into one product

-- First, let's see what duplicates we have
SELECT name, brand, COUNT(*) as count
FROM products 
WHERE name = 'Enduris 3'
GROUP BY name, brand
HAVING COUNT(*) > 1;

-- Check which product has reviews
SELECT 
    p.id, 
    p.name, 
    p.brand, 
    COUNT(r.id) as review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.name = 'Enduris 3'
GROUP BY p.id, p.name, p.brand
ORDER BY review_count DESC;

-- Update all reviews to point to the first Enduris 3 product (the one with most reviews)
-- Replace 'e1403600-5e31-405b-9da0-371dd830ff2e' with the ID of the product you want to keep
UPDATE reviews 
SET product_id = 'e1403600-5e31-405b-9da0-371dd830ff2e'
WHERE product_id = '8ae73a62-6308-42d2-92b5-a44757fdf3e4';

-- Delete the duplicate product (only after confirming reviews have been moved)
-- DELETE FROM products WHERE id = '8ae73a62-6308-42d2-92b5-a44757fdf3e4';

-- Verify the cleanup
SELECT 
    p.id, 
    p.name, 
    p.brand, 
    COUNT(r.id) as review_count
FROM products p
LEFT JOIN reviews r ON p.id = r.product_id
WHERE p.name = 'Enduris 3'
GROUP BY p.id, p.name, p.brand;
