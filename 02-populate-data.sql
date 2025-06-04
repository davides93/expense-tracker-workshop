-- Sample data for Retail Database - Exact Schema Match
-- Created: 2025-06-04

-- =====================================================
-- CLEAR EXISTING DATA
-- =====================================================
TRUNCATE TABLE Orders CASCADE;
TRUNCATE TABLE Customers CASCADE;
TRUNCATE TABLE Employees CASCADE;
TRUNCATE TABLE Products CASCADE;

-- Reset sequences
ALTER SEQUENCE customers_customerid_seq RESTART WITH 1;
ALTER SEQUENCE employees_employeeid_seq RESTART WITH 1;
ALTER SEQUENCE products_productid_seq RESTART WITH 1;
ALTER SEQUENCE orders_orderid_seq RESTART WITH 1;

-- =====================================================
-- INSERT CUSTOMERS DATA
-- =====================================================
INSERT INTO Customers (firstName, lastName, birthDate, anniversary) VALUES
('John', 'Smith', '1985-03-15', '2020-01-15'),
('Sarah', 'Johnson', '1990-07-22', '2019-06-10'),
('Michael', 'Brown', '1982-11-08', '2021-03-22'),
('Emily', 'Davis', '1988-04-12', '2018-09-05'),
('David', 'Wilson', '1975-09-30', '2017-12-01'),
('Jessica', 'Miller', '1992-01-18', '2020-07-14'),
('Christopher', 'Moore', '1987-06-25', '2019-11-30'),
('Amanda', 'Taylor', '1983-12-03', '2018-04-18'),
('Matthew', 'Anderson', '1991-08-14', '2021-01-25'),
('Ashley', 'Thomas', '1986-02-28', '2020-10-12'),
('James', 'Jackson', '1989-05-16', '2019-02-28'),
('Megan', 'White', '1984-10-07', '2018-08-15'),
('Robert', 'Harris', '1978-03-21', '2017-05-20'),
('Lisa', 'Martin', '1993-11-12', '2021-09-08'),
('William', 'Thompson', '1981-07-04', '2019-12-15');

-- =====================================================
-- INSERT EMPLOYEES DATA
-- =====================================================
INSERT INTO Employees (firstName, lastName, birthDate) VALUES
('Mark', 'Rodriguez', '1985-04-12'),
('Jennifer', 'Lee', '1990-08-25'),
('Kevin', 'Walker', '1987-01-15'),
('Nicole', 'Hall', '1992-06-30'),
('Brian', 'Allen', '1983-11-18'),
('Christina', 'Young', '1988-03-09'),
('Patrick', 'King', '1991-09-14'),
('Stephanie', 'Wright', '1986-12-02'),
('Anthony', 'Lopez', '1989-05-27'),
('Rachel', 'Hill', '1984-10-08');

-- =====================================================
-- INSERT PRODUCTS DATA
-- =====================================================
INSERT INTO Products (category, price) VALUES
-- Electronics
('Electronics', 299.99),
('Electronics', 499.99),
('Electronics', 149.99),
('Electronics', 79.99),
('Electronics', 199.99),

-- Clothing
('Clothing', 49.99),
('Clothing', 29.99),
('Clothing', 89.99),
('Clothing', 39.99),
('Clothing', 69.99),

-- Home & Garden
('Home & Garden', 159.99),
('Home & Garden', 89.99),
('Home & Garden', 249.99),
('Home & Garden', 34.99),
('Home & Garden', 119.99),

-- Books
('Books', 19.99),
('Books', 24.99),
('Books', 15.99),
('Books', 29.99),
('Books', 12.99),

-- Sports
('Sports', 129.99),
('Sports', 59.99),
('Sports', 199.99),
('Sports', 89.99),
('Sports', 45.99),

-- Beauty
('Beauty', 39.99),
('Beauty', 24.99),
('Beauty', 59.99),
('Beauty', 19.99);

-- =====================================================
-- INSERT ORDERS DATA
-- =====================================================
INSERT INTO Orders (customerID, employeeID, productID, orderTotal, orderDate) VALUES
-- January 2024 orders
(1, 1, 1, 299.99, '2024-01-15'),
(2, 2, 6, 49.99, '2024-01-16'),
(3, 1, 11, 159.99, '2024-01-18'),
(1, 3, 16, 19.99, '2024-01-20'),
(4, 2, 21, 129.99, '2024-01-22'),
(5, 4, 2, 499.99, '2024-01-25'),
(6, 1, 7, 29.99, '2024-01-28'),
(2, 5, 12, 89.99, '2024-01-30'),

-- February 2024 orders
(7, 3, 3, 149.99, '2024-02-02'),
(8, 6, 26, 39.99, '2024-02-05'),
(9, 2, 22, 59.99, '2024-02-08'),
(10, 7, 8, 89.99, '2024-02-10'),
(3, 1, 17, 24.99, '2024-02-12'),
(11, 8, 13, 249.99, '2024-02-15'),
(1, 4, 4, 79.99, '2024-02-18'),
(12, 9, 27, 24.99, '2024-02-20'),

-- March 2024 orders
(13, 5, 23, 199.99, '2024-03-01'),
(14, 10, 9, 39.99, '2024-03-05'),
(15, 6, 14, 34.99, '2024-03-08'),
(4, 3, 28, 59.99, '2024-03-10'),
(5, 7, 18, 15.99, '2024-03-12'),
(6, 1, 5, 199.99, '2024-03-15'),
(7, 8, 24, 89.99, '2024-03-18'),
(8, 2, 10, 69.99, '2024-03-20'),

-- April 2024 orders
(9, 9, 15, 119.99, '2024-04-02'),
(10, 4, 19, 29.99, '2024-04-05'),
(11, 5, 25, 45.99, '2024-04-08'),
(12, 10, 29, 19.99, '2024-04-10'),
(13, 6, 1, 299.99, '2024-04-12'),
(14, 1, 20, 12.99, '2024-04-15'),
(15, 7, 2, 499.99, '2024-04-18'),
(1, 3, 6, 49.99, '2024-04-20'),

-- May 2024 orders
(2, 8, 11, 159.99, '2024-05-01'),
(3, 2, 21, 129.99, '2024-05-05'),
(4, 9, 3, 149.99, '2024-05-08'),
(5, 4, 16, 19.99, '2024-05-10'),
(6, 1, 22, 59.99, '2024-05-12'),
(7, 5, 7, 29.99, '2024-05-15'),
(8, 10, 26, 39.99, '2024-05-18'),
(9, 6, 12, 89.99, '2024-05-20'),

-- Recent orders (June 2024)
(10, 3, 8, 89.99, '2024-06-01'),
(11, 7, 17, 24.99, '2024-06-03'),
(12, 1, 27, 24.99, '2024-06-05'),
(13, 8, 13, 249.99, '2024-06-08'),
(14, 2, 23, 199.99, '2024-06-10'),
(15, 9, 4, 79.99, '2024-06-12'),
(1, 4, 28, 59.99, '2024-06-15'),
(2, 5, 14, 34.99, '2024-06-18'),
(3, 6, 18, 15.99, '2024-06-20');

-- =====================================================
-- VERIFY DATA INSERTION
-- =====================================================

-- Show record counts
SELECT 'Customers' as table_name, COUNT(*) as record_count FROM Customers
UNION ALL
SELECT 'Employees' as table_name, COUNT(*) as record_count FROM Employees
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as record_count FROM Products
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as record_count FROM Orders;

-- Show sample data from each table
SELECT 'CUSTOMERS SAMPLE:' as info;
SELECT customerID, firstName, lastName, moneySpent FROM Customers LIMIT 5;

SELECT 'EMPLOYEES SAMPLE:' as info;
SELECT employeeID, firstName, lastName FROM Employees LIMIT 5;

SELECT 'PRODUCTS SAMPLE:' as info;
SELECT productID, category, price FROM Products LIMIT 5;

SELECT 'ORDERS SAMPLE:' as info;
SELECT orderID, customerID, employeeID, productID, orderTotal, orderDate FROM Orders LIMIT 5;
