-- Check current brand data in products table
SELECT id, name, brand, image_url 
FROM products 
WHERE name ILIKE '%enduris%' OR name ILIKE '%north face%';

-- Update brand for Enduris 3 if it exists
UPDATE products 
SET brand = 'The North Face' 
WHERE name ILIKE '%enduris%' AND (brand IS NULL OR brand = '');

-- Check all products with missing brands
SELECT id, name, brand 
FROM products 
WHERE brand IS NULL OR brand = '';

-- Example: Update other common brands (uncomment and modify as needed)
-- UPDATE products SET brand = 'Nike' WHERE name ILIKE '%nike%' AND (brand IS NULL OR brand = '');
-- UPDATE products SET brand = 'Adidas' WHERE name ILIKE '%adidas%' AND (brand IS NULL OR brand = '');
-- UPDATE products SET brand = 'Apple' WHERE name ILIKE '%iphone%' OR name ILIKE '%macbook%' AND (brand IS NULL OR brand = '');
