-- Useful Queries for Retail Database - Exact Schema Match
-- Created: 2025-06-04

-- =====================================================
-- CUSTOMER ANALYSIS QUERIES
-- =====================================================

-- 1. Top customers by money spent
SELECT 
    customerID,
    firstName || ' ' || lastName as customerName,
    moneySpent,
    anniversary
FROM Customers 
ORDER BY moneySpent DESC 
LIMIT 10;

-- 2. Customer lifetime value and order frequency
SELECT 
    c.customerID,
    c.firstName || ' ' || c.lastName as customerName,
    c.moneySpent,
    COUNT(o.orderID) as totalOrders,
    ROUND(c.moneySpent / NULLIF(COUNT(o.orderID), 0), 2) as avgOrderValue,
    MIN(o.orderDate) as firstOrder,
    MAX(o.orderDate) as lastOrder,
    EXTRACT(DAYS FROM (MAX(o.orderDate) - MIN(o.orderDate))) as customerLifespanDays
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.customerID, c.firstName, c.lastName, c.moneySpent
ORDER BY c.moneySpent DESC;

-- 3. Customers by age groups
SELECT 
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) < 25 THEN 'Under 25'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 45 AND 54 THEN '45-54'
        ELSE '55+'
    END as ageGroup,
    COUNT(*) as customerCount,
    ROUND(AVG(moneySpent), 2) as avgMoneySpent,
    ROUND(SUM(moneySpent), 2) as totalRevenue
FROM Customers 
WHERE birthDate IS NOT NULL
GROUP BY 
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) < 25 THEN 'Under 25'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthDate)) BETWEEN 45 AND 54 THEN '45-54'
        ELSE '55+'
    END
ORDER BY avgMoneySpent DESC;

-- 4. Anniversary month analysis
SELECT 
    EXTRACT(MONTH FROM anniversary) as anniversaryMonth,
    TO_CHAR(anniversary, 'Month') as monthName,
    COUNT(*) as customersWithAnniversary,
    ROUND(AVG(moneySpent), 2) as avgSpending
FROM Customers 
WHERE anniversary IS NOT NULL
GROUP BY EXTRACT(MONTH FROM anniversary), TO_CHAR(anniversary, 'Month')
ORDER BY anniversaryMonth;

-- =====================================================
-- PRODUCT ANALYSIS QUERIES
-- =====================================================

-- 5. Product performance by category
SELECT 
    p.category,
    COUNT(DISTINCT p.productID) as totalProducts,
    COUNT(o.orderID) as totalOrdersCount,
    ROUND(SUM(o.orderTotal), 2) as totalRevenue,
    ROUND(AVG(o.orderTotal), 2) as avgOrderValue,
    ROUND(AVG(p.price), 2) as avgProductPrice
FROM Products p
LEFT JOIN Orders o ON p.productID = o.productID
GROUP BY p.category
ORDER BY totalRevenue DESC;

-- 6. Best selling products
SELECT 
    p.productID,
    p.category,
    p.price,
    COUNT(o.orderID) as timesSold,
    ROUND(SUM(o.orderTotal), 2) as totalRevenue,
    ROUND(AVG(o.orderTotal), 2) as avgOrderValue
FROM Products p
LEFT JOIN Orders o ON p.productID = o.productID
GROUP BY p.productID, p.category, p.price
ORDER BY timesSold DESC, totalRevenue DESC
LIMIT 10;

-- 7. Products with no sales
SELECT 
    p.productID,
    p.category,
    p.price
FROM Products p
LEFT JOIN Orders o ON p.productID = o.productID
WHERE o.orderID IS NULL
ORDER BY p.category, p.price DESC;

-- 8. Price range analysis
SELECT 
    CASE 
        WHEN price < 25 THEN 'Under $25'
        WHEN price BETWEEN 25 AND 49.99 THEN '$25-$49.99'
        WHEN price BETWEEN 50 AND 99.99 THEN '$50-$99.99'
        WHEN price BETWEEN 100 AND 199.99 THEN '$100-$199.99'
        ELSE '$200+'
    END as priceRange,
    COUNT(DISTINCT p.productID) as productCount,
    COUNT(o.orderID) as totalSales,
    ROUND(SUM(o.orderTotal), 2) as totalRevenue
FROM Products p
LEFT JOIN Orders o ON p.productID = o.productID
GROUP BY 
    CASE 
        WHEN price < 25 THEN 'Under $25'
        WHEN price BETWEEN 25 AND 49.99 THEN '$25-$49.99'
        WHEN price BETWEEN 50 AND 99.99 THEN '$50-$99.99'
        WHEN price BETWEEN 100 AND 199.99 THEN '$100-$199.99'
        ELSE '$200+'
    END
ORDER BY MIN(price);

-- =====================================================
-- EMPLOYEE ANALYSIS QUERIES
-- =====================================================

-- 9. Employee performance metrics
SELECT 
    e.employeeID,
    e.firstName || ' ' || e.lastName as employeeName,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.birthDate)) as age,
    COUNT(o.orderID) as totalOrdersProcessed,
    ROUND(SUM(o.orderTotal), 2) as totalSalesAmount,
    ROUND(AVG(o.orderTotal), 2) as avgOrderValue,
    COUNT(DISTINCT o.customerID) as uniqueCustomersServed
FROM Employees e
LEFT JOIN Orders o ON e.employeeID = o.employeeID
GROUP BY e.employeeID, e.firstName, e.lastName, e.birthDate
ORDER BY totalSalesAmount DESC;

-- 10. Employee sales by month
SELECT 
    e.firstName || ' ' || e.lastName as employeeName,
    EXTRACT(YEAR FROM o.orderDate) as year,
    EXTRACT(MONTH FROM o.orderDate) as month,
    TO_CHAR(o.orderDate, 'YYYY-MM') as yearMonth,
    COUNT(o.orderID) as ordersProcessed,
    ROUND(SUM(o.orderTotal), 2) as monthlySales
FROM Employees e
JOIN Orders o ON e.employeeID = o.employeeID
GROUP BY e.firstName, e.lastName, EXTRACT(YEAR FROM o.orderDate), EXTRACT(MONTH FROM o.orderDate), TO_CHAR(o.orderDate, 'YYYY-MM')
ORDER BY year DESC, month DESC, monthlySales DESC;

-- =====================================================
-- ORDER ANALYSIS QUERIES
-- =====================================================

-- 11. Sales trends by month
SELECT 
    EXTRACT(YEAR FROM orderDate) as year,
    EXTRACT(MONTH FROM orderDate) as month,
    TO_CHAR(orderDate, 'YYYY-MM') as yearMonth,
    COUNT(orderID) as totalOrders,
    ROUND(SUM(orderTotal), 2) as totalRevenue,
    ROUND(AVG(orderTotal), 2) as avgOrderValue,
    COUNT(DISTINCT customerID) as uniqueCustomers
FROM Orders
GROUP BY EXTRACT(YEAR FROM orderDate), EXTRACT(MONTH FROM orderDate), TO_CHAR(orderDate, 'YYYY-MM')
ORDER BY year DESC, month DESC;

-- 12. Daily sales for current month
SELECT 
    orderDate,
    TO_CHAR(orderDate, 'Day') as dayOfWeek,
    COUNT(orderID) as ordersCount,
    ROUND(SUM(orderTotal), 2) as dailyRevenue,
    ROUND(AVG(orderTotal), 2) as avgOrderValue
FROM Orders
WHERE EXTRACT(YEAR FROM orderDate) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM orderDate) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY orderDate, TO_CHAR(orderDate, 'Day')
ORDER BY orderDate DESC;

-- 13. High value orders (above average)
WITH order_stats AS (
    SELECT AVG(orderTotal) as avg_order_total FROM Orders
)
SELECT 
    o.orderID,
    c.firstName || ' ' || c.lastName as customerName,
    e.firstName || ' ' || e.lastName as employeeName,
    p.category as productCategory,
    o.orderTotal,
    o.orderDate,
    ROUND(o.orderTotal - os.avg_order_total, 2) as aboveAverage
FROM Orders o
JOIN Customers c ON o.customerID = c.customerID
JOIN Employees e ON o.employeeID = e.employeeID
JOIN Products p ON o.productID = p.productID
CROSS JOIN order_stats os
WHERE o.orderTotal > os.avg_order_total
ORDER BY o.orderTotal DESC;

-- =====================================================
-- BUSINESS INSIGHTS QUERIES
-- =====================================================

-- 14. Customer retention analysis
SELECT 
    c.customerID,
    c.firstName || ' ' || c.lastName as customerName,
    COUNT(o.orderID) as totalOrders,
    MIN(o.orderDate) as firstOrderDate,
    MAX(o.orderDate) as lastOrderDate,
    EXTRACT(DAYS FROM (MAX(o.orderDate) - MIN(o.orderDate))) as daysBetweenFirstLast,
    CASE 
        WHEN COUNT(o.orderID) = 1 THEN 'One-time Customer'
        WHEN EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.orderDate))) <= 30 THEN 'Active Customer'
        WHEN EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.orderDate))) <= 90 THEN 'Recent Customer'
        ELSE 'Inactive Customer'
    END as customerStatus
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.customerID, c.firstName, c.lastName
ORDER BY lastOrderDate DESC;

-- 15. Revenue by customer and product category
SELECT 
    c.firstName || ' ' || c.lastName as customerName,
    p.category,
    COUNT(o.orderID) as ordersInCategory,
    ROUND(SUM(o.orderTotal), 2) as totalSpentInCategory,
    ROUND(AVG(o.orderTotal), 2) as avgOrderValueInCategory
FROM Orders o
JOIN Customers c ON o.customerID = c.customerID
JOIN Products p ON o.productID = p.productID
GROUP BY c.customerID, c.firstName, c.lastName, p.category
ORDER BY customerName, totalSpentInCategory DESC;

-- =====================================================
-- DATA VALIDATION QUERIES
-- =====================================================

-- 16. Data integrity checks
SELECT 'Data Integrity Report' as report_title;

-- Check for customers with orders but zero money spent
SELECT 'Customers with orders but zero moneySpent:' as check_type, COUNT(*) as count
FROM Customers c
JOIN Orders o ON c.customerID = o.customerID
WHERE c.moneySpent = 0;

-- Check for negative values
SELECT 'Products with negative prices:' as check_type, COUNT(*) as count
FROM Products WHERE price < 0
UNION ALL
SELECT 'Orders with negative totals:' as check_type, COUNT(*) as count
FROM Orders WHERE orderTotal < 0
UNION ALL
SELECT 'Customers with negative moneySpent:' as check_type, COUNT(*) as count
FROM Customers WHERE moneySpent < 0;

-- Check for future dates
SELECT 'Orders with future dates:' as check_type, COUNT(*) as count
FROM Orders WHERE orderDate > CURRENT_DATE
UNION ALL
SELECT 'Customers with future birth dates:' as check_type, COUNT(*) as count
FROM Customers WHERE birthDate > CURRENT_DATE
UNION ALL
SELECT 'Employees with future birth dates:' as check_type, COUNT(*) as count
FROM Employees WHERE birthDate > CURRENT_DATE;

-- =====================================================
-- SUMMARY DASHBOARD QUERY
-- =====================================================

-- 17. Executive dashboard summary
SELECT 'BUSINESS SUMMARY DASHBOARD' as dashboard_title;

SELECT 
    'Total Customers' as metric,
    COUNT(*)::text as value
FROM Customers
UNION ALL
SELECT 
    'Total Products' as metric,
    COUNT(*)::text as value
FROM Products
UNION ALL
SELECT 
    'Total Employees' as metric,
    COUNT(*)::text as value
FROM Employees
UNION ALL
SELECT 
    'Total Orders' as metric,
    COUNT(*)::text as value
FROM Orders
UNION ALL
SELECT 
    'Total Revenue' as metric,
    '$' || ROUND(SUM(orderTotal), 2)::text as value
FROM Orders
UNION ALL
SELECT 
    'Average Order Value' as metric,
    '$' || ROUND(AVG(orderTotal), 2)::text as value
FROM Orders
UNION ALL
SELECT 
    'Top Product Category' as metric,
    category as value
FROM (
    SELECT p.category, SUM(o.orderTotal) as revenue
    FROM Products p
    JOIN Orders o ON p.productID = o.productID
    GROUP BY p.category
    ORDER BY revenue DESC
    LIMIT 1
) top_category;
