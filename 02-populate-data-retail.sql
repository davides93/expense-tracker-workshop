-- Sample Data for Retail Database Schema
-- Based on the provided schema image
-- Created: 2025-06-04

-- =====================================================
-- DISABLE TRIGGERS TEMPORARILY FOR BULK INSERT
-- =====================================================
ALTER TABLE orders DISABLE TRIGGER trigger_update_customer_money_spent;

-- =====================================================
-- INSERT SAMPLE CUSTOMERS
-- =====================================================
INSERT INTO customers (first_name, last_name, birth_date, anniversary) VALUES
('John', 'Smith', '1985-03-15', '2020-06-01'),
('Mary', 'Johnson', '1990-07-22', '2019-11-15'),
('Robert', 'Williams', '1978-12-08', '2018-04-20'),
('Jennifer', 'Brown', '1992-01-30', '2021-08-10'),
('Michael', 'Davis', '1980-09-12', '2017-12-05'),
('Linda', 'Miller', '1975-05-18', '2022-02-14'),
('David', 'Wilson', '1988-11-03', '2020-09-22'),
('Susan', 'Moore', '1983-04-27', '2019-07-30'),
('James', 'Taylor', '1995-08-14', '2023-01-18'),
('Barbara', 'Anderson', '1970-06-25', '2016-10-12'),
('Christopher', 'Thomas', '1987-02-09', '2021-05-25'),
('Nancy', 'Jackson', '1993-10-16', '2022-12-08'),
('Matthew', 'White', '1982-07-31', '2018-03-14'),
('Lisa', 'Harris', '1989-12-20', '2020-11-27'),
('Anthony', 'Martin', '1991-03-07', '2019-09-05');

-- =====================================================
-- INSERT SAMPLE EMPLOYEES
-- =====================================================
INSERT INTO employees (first_name, last_name, birth_date, hire_date, department, salary) VALUES
('Alice', 'Cooper', '1985-04-12', '2020-01-15', 'Sales', 45000.00),
('Bob', 'Johnson', '1980-09-23', '2018-03-22', 'Sales', 52000.00),
('Carol', 'Williams', '1992-01-18', '2021-06-10', 'Sales', 38000.00),
('Daniel', 'Brown', '1988-07-30', '2019-11-05', 'Management', 75000.00),
('Emma', 'Davis', '1990-12-14', '2020-08-18', 'Sales', 41000.00),
('Frank', 'Miller', '1975-05-08', '2015-02-28', 'Management', 85000.00),
('Grace', 'Wilson', '1987-11-25', '2019-09-12', 'Sales', 47000.00),
('Henry', 'Moore', '1983-03-16', '2017-07-03', 'Sales', 55000.00),
('Irene', 'Taylor', '1991-08-02', '2022-01-20', 'Sales', 39000.00),
('Jack', 'Anderson', '1979-06-11', '2016-04-15', 'Management', 78000.00);

-- =====================================================
-- INSERT SAMPLE PRODUCTS
-- =====================================================
INSERT INTO products (product_name, category, price, description, stock_quantity) VALUES
-- Electronics
('iPhone 15', 'Electronics', 999.00, 'Latest Apple smartphone with advanced features', 50),
('Samsung Galaxy S24', 'Electronics', 899.00, 'Premium Android smartphone', 45),
('MacBook Pro 16"', 'Electronics', 2499.00, 'Professional laptop for creative work', 25),
('Dell XPS 13', 'Electronics', 1299.00, 'Ultrabook for business and personal use', 30),
('iPad Air', 'Electronics', 599.00, 'Versatile tablet for work and entertainment', 40),
('AirPods Pro', 'Electronics', 249.00, 'Wireless earbuds with noise cancellation', 100),
('Sony WH-1000XM5', 'Electronics', 399.00, 'Premium noise-cancelling headphones', 35),
('Apple Watch Series 9', 'Electronics', 399.00, 'Smartwatch with health monitoring', 60),

-- Clothing
('Levi\'s 501 Jeans', 'Clothing', 79.99, 'Classic straight-fit denim jeans', 120),
('Nike Air Max 90', 'Clothing', 119.99, 'Iconic sneakers for everyday wear', 80),
('Adidas Ultraboost 22', 'Clothing', 189.99, 'High-performance running shoes', 65),
('North Face Jacket', 'Clothing', 199.99, 'Waterproof outdoor jacket', 40),
('Ralph Lauren Polo Shirt', 'Clothing', 89.99, 'Classic cotton polo shirt', 95),
('Uniqlo Cashmere Sweater', 'Clothing', 99.99, 'Soft cashmere pullover sweater', 55),
('Tommy Hilfiger Dress', 'Clothing', 129.99, 'Elegant casual dress', 45),
('Calvin Klein T-Shirt', 'Clothing', 29.99, 'Premium cotton basic tee', 150),

-- Home & Garden
('Dyson V15 Vacuum', 'Home & Garden', 749.99, 'Cordless vacuum with laser detection', 20),
('Ninja Blender', 'Home & Garden', 99.99, 'High-speed blender for smoothies', 75),
('KitchenAid Stand Mixer', 'Home & Garden', 349.99, 'Professional-grade stand mixer', 30),
('Instant Pot Duo', 'Home & Garden', 89.99, 'Multi-functional pressure cooker', 85),
('Philips Air Fryer', 'Home & Garden', 199.99, 'Healthy cooking with hot air circulation', 50),
('Roomba i7+', 'Home & Garden', 599.99, 'Smart robot vacuum with auto-empty base', 25),
('Weber Genesis Grill', 'Home & Garden', 899.99, 'Premium gas grill for outdoor cooking', 15),
('Shark Steam Mop', 'Home & Garden', 79.99, 'Steam cleaning for hard floors', 60),

-- Sports & Outdoors
('Peloton Bike+', 'Sports & Outdoors', 2495.00, 'Interactive exercise bike with classes', 10),
('Yeti Cooler 45Qt', 'Sports & Outdoors', 349.99, 'Premium insulated cooler', 35),
('Patagonia Backpack', 'Sports & Outdoors', 129.99, 'Durable hiking backpack', 40),
('Coleman Camping Tent', 'Sports & Outdoors', 199.99, '4-person waterproof tent', 25),
('Wilson Tennis Racket', 'Sports & Outdoors', 189.99, 'Professional tennis racket', 30),
('Nike Basketball', 'Sports & Outdoors', 49.99, 'Official size basketball', 85),
('Fitbit Charge 5', 'Sports & Outdoors', 149.99, 'Advanced fitness tracker', 70),
('Hydro Flask Water Bottle', 'Sports & Outdoors', 39.99, 'Insulated stainless steel bottle', 120);

-- =====================================================
-- INSERT SAMPLE ORDERS
-- =====================================================
INSERT INTO orders (customer_id, employee_id, product_id, quantity, unit_price, order_total, order_date, order_status) VALUES
-- Recent orders (last 30 days)
(1, 1, 1, 1, 999.00, 999.00, '2025-05-15', 'completed'),
(2, 2, 9, 2, 79.99, 159.98, '2025-05-16', 'completed'),
(3, 1, 3, 1, 2499.00, 2499.00, '2025-05-18', 'completed'),
(4, 3, 6, 1, 249.00, 249.00, '2025-05-20', 'completed'),
(5, 2, 10, 1, 119.99, 119.99, '2025-05-22', 'completed'),
(1, 4, 18, 1, 29.99, 29.99, '2025-05-25', 'completed'),
(6, 1, 19, 1, 749.99, 749.99, '2025-05-28', 'completed'),
(7, 5, 11, 1, 189.99, 189.99, '2025-05-30', 'completed'),
(8, 3, 5, 1, 599.00, 599.00, '2025-06-01', 'shipped'),
(9, 2, 20, 1, 99.99, 99.99, '2025-06-02', 'processing'),

-- Orders from last month
(2, 1, 13, 1, 89.99, 89.99, '2025-04-15', 'completed'),
(10, 4, 27, 1, 2495.00, 2495.00, '2025-04-18', 'completed'),
(3, 2, 7, 1, 399.00, 399.00, '2025-04-20', 'completed'),
(11, 5, 12, 1, 199.99, 199.99, '2025-04-22', 'completed'),
(4, 1, 15, 1, 129.99, 129.99, '2025-04-25', 'completed'),
(12, 3, 8, 1, 399.00, 399.00, '2025-04-28', 'completed'),
(5, 2, 21, 1, 349.99, 349.99, '2025-04-30', 'completed'),

-- Orders from 2-3 months ago
(13, 4, 2, 1, 899.00, 899.00, '2025-03-10', 'completed'),
(6, 1, 22, 1, 89.99, 89.99, '2025-03-15', 'completed'),
(14, 5, 4, 1, 1299.00, 1299.00, '2025-03-18', 'completed'),
(7, 2, 23, 1, 199.99, 199.99, '2025-03-22', 'completed'),
(15, 3, 14, 1, 99.99, 99.99, '2025-03-25', 'completed'),
(8, 1, 24, 1, 349.99, 349.99, '2025-03-28', 'completed'),
(9, 4, 16, 1, 79.99, 79.99, '2025-02-12', 'completed'),
(10, 2, 25, 1, 189.99, 189.99, '2025-02-15', 'completed'),
(11, 5, 17, 1, 29.99, 29.99, '2025-02-18', 'completed'),
(12, 1, 26, 1, 49.99, 49.99, '2025-02-22', 'completed'),

-- Older orders (for historical data)
(1, 3, 28, 1, 149.99, 149.99, '2025-01-15', 'completed'),
(2, 2, 29, 2, 39.99, 79.98, '2025-01-20', 'completed'),
(3, 4, 19, 1, 749.99, 749.99, '2024-12-15', 'completed'),
(4, 1, 10, 1, 119.99, 119.99, '2024-12-20', 'completed'),
(5, 5, 11, 1, 189.99, 189.99, '2024-11-25', 'completed'),
(6, 2, 12, 1, 199.99, 199.99, '2024-11-28', 'completed'),
(7, 3, 13, 1, 89.99, 89.99, '2024-10-15', 'completed'),
(8, 1, 14, 1, 99.99, 99.99, '2024-10-18', 'completed'),
(9, 4, 15, 1, 129.99, 129.99, '2024-09-22', 'completed'),
(10, 2, 16, 1, 79.99, 79.99, '2024-09-25', 'completed'),

-- Multiple items orders
(11, 5, 17, 3, 29.99, 89.97, '2025-05-10', 'completed'),
(12, 1, 6, 2, 249.00, 498.00, '2025-05-12', 'completed'),
(13, 3, 29, 4, 39.99, 159.96, '2025-05-14', 'completed'),
(14, 2, 26, 2, 49.99, 99.98, '2025-04-08', 'completed'),
(15, 4, 18, 5, 29.99, 149.95, '2025-04-10', 'completed');

-- =====================================================
-- RE-ENABLE TRIGGERS AND UPDATE CUSTOMER MONEY_SPENT
-- =====================================================
ALTER TABLE orders ENABLE TRIGGER trigger_update_customer_money_spent;

-- Update customer money_spent based on existing orders
UPDATE customers SET money_spent = (
    SELECT COALESCE(SUM(order_total), 0) 
    FROM orders 
    WHERE orders.customer_id = customers.customer_id
);

-- =====================================================
-- UPDATE PRODUCT STOCK BASED ON ORDERS
-- =====================================================
UPDATE products SET stock_quantity = stock_quantity - (
    SELECT COALESCE(SUM(quantity), 0) 
    FROM orders 
    WHERE orders.product_id = products.product_id
);

-- =====================================================
-- VERIFY DATA INTEGRITY
-- =====================================================

-- Check that all foreign keys are valid
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check invalid customer references in orders
    SELECT COUNT(*) INTO invalid_count
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    WHERE c.customer_id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid customer references in orders', invalid_count;
    END IF;
    
    -- Check invalid product references in orders
    SELECT COUNT(*) INTO invalid_count
    FROM orders o
    LEFT JOIN products p ON o.product_id = p.product_id
    WHERE p.product_id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid product references in orders', invalid_count;
    END IF;
    
    -- Check invalid employee references in orders
    SELECT COUNT(*) INTO invalid_count
    FROM orders o
    LEFT JOIN employees e ON o.employee_id = e.employee_id
    WHERE o.employee_id IS NOT NULL AND e.employee_id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid employee references in orders', invalid_count;
    END IF;
    
    RAISE NOTICE 'Data integrity checks passed successfully!';
END $$;

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================
SELECT 'Data Population Summary:' as info;

SELECT 
    'Customers' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM customers

UNION ALL

SELECT 
    'Employees',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM employees

UNION ALL

SELECT 
    'Products',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM products

UNION ALL

SELECT 
    'Orders',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM orders;

-- Show some quick statistics
SELECT 
    'Total Revenue' as metric,
    TO_CHAR(SUM(order_total), 'FM$999,999,990.00') as value
FROM orders
WHERE order_status = 'completed'

UNION ALL

SELECT 
    'Average Order Value',
    TO_CHAR(AVG(order_total), 'FM$999,990.00')
FROM orders
WHERE order_status = 'completed'

UNION ALL

SELECT 
    'Total Customers',
    COUNT(*)::text
FROM customers

UNION ALL

SELECT 
    'Active Products',
    COUNT(*)::text
FROM products
WHERE is_active = true

UNION ALL

SELECT 
    'Active Employees',
    COUNT(*)::text
FROM employees;

SELECT 'Sample data loaded successfully!' as status;
