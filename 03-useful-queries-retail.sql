-- Useful Queries for Retail Database Schema
-- Based on the provided schema image (Customers, Products, Orders, Employees)
-- Created: 2025-06-04

-- ======================
-- CUSTOMER ANALYSIS
-- ======================

-- 1. Customer overview with purchase summary
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name as full_name,
    c.birth_date,
    EXTRACT(YEAR FROM AGE(c.birth_date)) as age,
    c.anniversary,
    c.money_spent,
    COUNT(o.order_id) as total_orders,
    MIN(o.order_date) as first_purchase,
    MAX(o.order_date) as last_purchase,
    AVG(o.order_total) as avg_order_value,
    SUM(o.quantity) as total_items_purchased
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name, c.birth_date, c.anniversary, c.money_spent
ORDER BY c.money_spent DESC;

-- 2. Top spending customers (last 6 months)
SELECT 
    c.first_name || ' ' || c.last_name as customer_name,
    COUNT(o.order_id) as orders_last_6_months,
    SUM(o.order_total) as spent_last_6_months,
    AVG(o.order_total) as avg_order_value,
    c.money_spent as total_lifetime_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 months'
    AND o.order_status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name, c.money_spent
HAVING SUM(o.order_total) > 500
ORDER BY spent_last_6_months DESC;

-- 3. Customer lifecycle analysis
SELECT 
    CASE 
        WHEN MAX(o.order_date) >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
        WHEN MAX(o.order_date) >= CURRENT_DATE - INTERVAL '90 days' THEN 'At Risk'
        WHEN MAX(o.order_date) >= CURRENT_DATE - INTERVAL '180 days' THEN 'Churning'
        ELSE 'Churned'
    END as customer_status,
    COUNT(*) as customer_count,
    AVG(c.money_spent) as avg_lifetime_value,
    SUM(c.money_spent) as total_revenue
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status = 'completed'
GROUP BY 1
ORDER BY customer_count DESC;

-- ======================
-- PRODUCT ANALYSIS
-- ======================

-- 4. Product performance summary
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.price,
    p.stock_quantity,
    COUNT(o.order_id) as total_orders,
    SUM(o.quantity) as total_quantity_sold,
    SUM(o.order_total) as total_revenue,
    AVG(o.order_total) as avg_order_value,
    p.price * p.stock_quantity as inventory_value
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id AND o.order_status = 'completed'
GROUP BY p.product_id, p.product_name, p.category, p.price, p.stock_quantity
ORDER BY total_revenue DESC NULLS LAST;

-- 5. Top selling products by category
WITH product_sales AS (
    SELECT 
        p.category,
        p.product_name,
        SUM(o.quantity) as total_sold,
        SUM(o.order_total) as total_revenue,
        ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(o.order_total) DESC) as rank
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    WHERE o.order_status = 'completed'
    GROUP BY p.category, p.product_id, p.product_name
)
SELECT 
    category,
    product_name,
    total_sold,
    TO_CHAR(total_revenue, 'FM$999,999,990.00') as total_revenue
FROM product_sales
WHERE rank <= 3
ORDER BY category, rank;

-- 6. Products needing restock (low inventory)
SELECT 
    p.product_name,
    p.category,
    p.stock_quantity,
    p.price,
    COALESCE(sales_last_30.quantity_sold, 0) as sold_last_30_days,
    CASE 
        WHEN COALESCE(sales_last_30.quantity_sold, 0) > 0 
        THEN p.stock_quantity / (sales_last_30.quantity_sold / 30.0)
        ELSE NULL 
    END as days_of_inventory,
    p.price * 50 as suggested_reorder_value  -- Assuming 50 units reorder
FROM products p
LEFT JOIN (
    SELECT 
        product_id,
        SUM(quantity) as quantity_sold
    FROM orders
    WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
        AND order_status = 'completed'
    GROUP BY product_id
) sales_last_30 ON p.product_id = sales_last_30.product_id
WHERE p.stock_quantity < 30  -- Low stock threshold
    AND p.is_active = true
ORDER BY 
    CASE 
        WHEN sales_last_30.quantity_sold > 0 
        THEN p.stock_quantity / (sales_last_30.quantity_sold / 30.0)
        ELSE 999 
    END;

-- ======================
-- EMPLOYEE ANALYSIS
-- ======================

-- 7. Employee sales performance
SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name as full_name,
    e.department,
    e.hire_date,
    ROUND(EXTRACT(EPOCH FROM AGE(e.hire_date)) / (365.25 * 24 * 3600), 1) as years_employed,
    COUNT(o.order_id) as total_orders,
    SUM(o.order_total) as total_sales,
    AVG(o.order_total) as avg_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    MIN(o.order_date) as first_sale,
    MAX(o.order_date) as last_sale
FROM employees e
LEFT JOIN orders o ON e.employee_id = o.employee_id AND o.order_status = 'completed'
GROUP BY e.employee_id, e.first_name, e.last_name, e.department, e.hire_date, e.salary
ORDER BY total_sales DESC NULLS LAST;

-- 8. Monthly employee performance comparison
SELECT 
    DATE_TRUNC('month', o.order_date) as month,
    e.first_name || ' ' || e.last_name as employee_name,
    e.department,
    COUNT(o.order_id) as orders_processed,
    SUM(o.order_total) as monthly_sales,
    AVG(o.order_total) as avg_order_value
FROM employees e
JOIN orders o ON e.employee_id = o.employee_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 months'
    AND o.order_status = 'completed'
GROUP BY DATE_TRUNC('month', o.order_date), e.employee_id, e.first_name, e.last_name, e.department
ORDER BY month DESC, monthly_sales DESC;

-- ======================
-- SALES ANALYSIS
-- ======================

-- 9. Daily sales trends (last 30 days)
SELECT 
    o.order_date,
    TO_CHAR(o.order_date, 'Day') as day_of_week,
    COUNT(o.order_id) as total_orders,
    SUM(o.order_total) as daily_revenue,
    AVG(o.order_total) as avg_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COUNT(DISTINCT o.product_id) as unique_products
FROM orders o
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
    AND o.order_status = 'completed'
GROUP BY o.order_date
ORDER BY o.order_date DESC;

-- 10. Monthly sales summary with year-over-year comparison
WITH monthly_sales AS (
    SELECT 
        EXTRACT(YEAR FROM order_date) as year,
        EXTRACT(MONTH FROM order_date) as month,
        TO_CHAR(order_date, 'Month YYYY') as month_year,
        COUNT(order_id) as total_orders,
        SUM(order_total) as total_revenue,
        AVG(order_total) as avg_order_value,
        COUNT(DISTINCT customer_id) as unique_customers
    FROM orders
    WHERE order_status = 'completed'
    GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date), TO_CHAR(order_date, 'Month YYYY')
)
SELECT 
    month_year,
    total_orders,
    TO_CHAR(total_revenue, 'FM$999,999,990.00') as total_revenue,
    TO_CHAR(avg_order_value, 'FM$999,990.00') as avg_order_value,
    unique_customers,
    LAG(total_revenue) OVER (ORDER BY year, month) as prev_month_revenue,
    CASE 
        WHEN LAG(total_revenue) OVER (ORDER BY year, month) IS NOT NULL 
        THEN ROUND(((total_revenue - LAG(total_revenue) OVER (ORDER BY year, month)) / LAG(total_revenue) OVER (ORDER BY year, month)) * 100, 2) 
        ELSE NULL 
    END as revenue_growth_pct
FROM monthly_sales
ORDER BY year DESC, month DESC;

-- ======================
-- CATEGORY ANALYSIS
-- ======================

-- 11. Sales by product category
SELECT 
    p.category,
    COUNT(DISTINCT p.product_id) as total_products,
    COUNT(o.order_id) as total_orders,
    SUM(o.quantity) as total_quantity_sold,
    SUM(o.order_total) as total_revenue,
    AVG(o.order_total) as avg_order_value,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    SUM(o.order_total) / SUM(SUM(o.order_total)) OVER () * 100 as revenue_percentage
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id AND o.order_status = 'completed'
GROUP BY p.category
ORDER BY total_revenue DESC NULLS LAST;

-- 12. Category performance trends (last 6 months)
SELECT 
    p.category,
    DATE_TRUNC('month', o.order_date) as month,
    COUNT(o.order_id) as orders,
    SUM(o.order_total) as revenue,
    AVG(o.order_total) as avg_order_value
FROM products p
JOIN orders o ON p.product_id = o.product_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 months'
    AND o.order_status = 'completed'
GROUP BY p.category, DATE_TRUNC('month', o.order_date)
ORDER BY p.category, month DESC;

-- ======================
-- CUSTOMER SEGMENTATION
-- ======================

-- 13. Customer segmentation by purchase behavior
WITH customer_metrics AS (
    SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name as customer_name,
        c.money_spent,
        COUNT(o.order_id) as order_frequency,
        AVG(o.order_total) as avg_order_value,
        MAX(o.order_date) as last_purchase_date,
        CURRENT_DATE - MAX(o.order_date) as days_since_last_purchase
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.order_status = 'completed'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.money_spent
)
SELECT 
    customer_name,
    money_spent,
    order_frequency,
    TO_CHAR(avg_order_value, 'FM$999,990.00') as avg_order_value,
    last_purchase_date,
    days_since_last_purchase,
    CASE 
        WHEN money_spent >= 2000 AND order_frequency >= 10 THEN 'VIP Customer'
        WHEN money_spent >= 1000 AND order_frequency >= 5 THEN 'High Value'
        WHEN money_spent >= 500 AND order_frequency >= 3 THEN 'Regular Customer'
        WHEN money_spent >= 100 AND order_frequency >= 1 THEN 'Occasional Buyer'
        ELSE 'New Customer'
    END as customer_segment
FROM customer_metrics
ORDER BY money_spent DESC;

-- ======================
-- INVENTORY AND FINANCIAL ANALYSIS
-- ======================

-- 14. Inventory valuation by category
SELECT 
    category,
    COUNT(*) as product_count,
    SUM(stock_quantity) as total_units,
    SUM(price * stock_quantity) as inventory_value,
    AVG(price) as avg_product_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
WHERE is_active = true
GROUP BY category
ORDER BY inventory_value DESC;

-- 15. Revenue and profit analysis (assuming 30% markup)
WITH profit_analysis AS (
    SELECT 
        o.order_id,
        o.order_date,
        o.order_total,
        p.category,
        o.order_total * 0.7 as estimated_cost,  -- Assuming 30% markup
        o.order_total * 0.3 as estimated_profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    WHERE o.order_status = 'completed'
)
SELECT 
    category,
    COUNT(*) as total_orders,
    SUM(order_total) as total_revenue,
    SUM(estimated_cost) as estimated_total_cost,
    SUM(estimated_profit) as estimated_total_profit,
    ROUND((SUM(estimated_profit) / SUM(order_total)) * 100, 2) as profit_margin_pct
FROM profit_analysis
GROUP BY category
ORDER BY estimated_total_profit DESC;

-- ======================
-- CUSTOMER RETENTION ANALYSIS
-- ======================

-- 16. Customer retention by cohort
WITH first_purchase AS (
    SELECT 
        customer_id,
        MIN(order_date) as first_purchase_date,
        DATE_TRUNC('month', MIN(order_date)) as cohort_month
    FROM orders
    WHERE order_status = 'completed'
    GROUP BY customer_id
),
customer_orders AS (
    SELECT 
        fp.customer_id,
        fp.cohort_month,
        o.order_date,
        DATE_TRUNC('month', o.order_date) as order_month,
        EXTRACT(EPOCH FROM DATE_TRUNC('month', o.order_date) - fp.cohort_month) / (30*24*3600) as month_number
    FROM first_purchase fp
    JOIN orders o ON fp.customer_id = o.customer_id AND o.order_status = 'completed'
)
SELECT 
    cohort_month,
    COUNT(DISTINCT customer_id) as cohort_size,
    COUNT(DISTINCT CASE WHEN month_number = 0 THEN customer_id END) as month_0,
    COUNT(DISTINCT CASE WHEN month_number = 1 THEN customer_id END) as month_1,
    COUNT(DISTINCT CASE WHEN month_number = 2 THEN customer_id END) as month_2,
    COUNT(DISTINCT CASE WHEN month_number = 3 THEN customer_id END) as month_3,
    ROUND(COUNT(DISTINCT CASE WHEN month_number = 1 THEN customer_id END)::DECIMAL / 
          COUNT(DISTINCT CASE WHEN month_number = 0 THEN customer_id END) * 100, 2) as month_1_retention,
    ROUND(COUNT(DISTINCT CASE WHEN month_number = 2 THEN customer_id END)::DECIMAL / 
          COUNT(DISTINCT CASE WHEN month_number = 0 THEN customer_id END) * 100, 2) as month_2_retention,
    ROUND(COUNT(DISTINCT CASE WHEN month_number = 3 THEN customer_id END)::DECIMAL / 
          COUNT(DISTINCT CASE WHEN month_number = 0 THEN customer_id END) * 100, 2) as month_3_retention
FROM customer_orders
GROUP BY cohort_month
HAVING COUNT(DISTINCT customer_id) >= 5  -- Only show cohorts with at least 5 customers
ORDER BY cohort_month;

-- ======================
-- OPERATIONAL QUERIES
-- ======================

-- 17. Current order status summary
SELECT 
    order_status,
    COUNT(*) as order_count,
    SUM(order_total) as total_value,
    AVG(order_total) as avg_order_value,
    MIN(order_date) as oldest_order,
    MAX(order_date) as newest_order
FROM orders
GROUP BY order_status
ORDER BY 
    CASE order_status
        WHEN 'processing' THEN 1
        WHEN 'shipped' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'cancelled' THEN 4
        ELSE 5
    END;

-- 18. Employee workload distribution
SELECT 
    e.first_name || ' ' || e.last_name as employee_name,
    e.department,
    COUNT(CASE WHEN o.order_status = 'processing' THEN 1 END) as orders_processing,
    COUNT(CASE WHEN o.order_status = 'shipped' THEN 1 END) as orders_shipped,
    COUNT(CASE WHEN o.order_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as orders_last_week,
    COUNT(o.order_id) as total_active_orders
FROM employees e
LEFT JOIN orders o ON e.employee_id = o.employee_id 
    AND o.order_status IN ('processing', 'shipped')
GROUP BY e.employee_id, e.first_name, e.last_name, e.department
ORDER BY total_active_orders DESC;

-- ======================
-- PERFORMANCE TESTING QUERIES
-- ======================

-- 19. Query performance test - Complex join with aggregation
EXPLAIN ANALYZE
SELECT 
    c.first_name || ' ' || c.last_name as customer_name,
    p.category,
    COUNT(o.order_id) as orders,
    SUM(o.order_total) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN products p ON o.product_id = p.product_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '90 days'
    AND o.order_status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name, p.category
HAVING SUM(o.order_total) > 200
ORDER BY total_spent DESC;

-- 20. Data validation and integrity checks
SELECT 'Data Integrity Check Results:' as info;

-- Check for orders with invalid totals
SELECT 'Orders with Invalid Totals' as check_name, COUNT(*) as issues
FROM orders 
WHERE ABS(order_total - (quantity * unit_price)) > 0.01

UNION ALL

-- Check for customers with incorrect money_spent
SELECT 'Customers with Incorrect Money Spent', COUNT(*)
FROM customers c
WHERE ABS(c.money_spent - COALESCE((
    SELECT SUM(o.order_total) 
    FROM orders o 
    WHERE o.customer_id = c.customer_id AND o.order_status = 'completed'
), 0)) > 0.01

UNION ALL

-- Check for products with negative stock
SELECT 'Products with Negative Stock', COUNT(*)
FROM products
WHERE stock_quantity < 0

UNION ALL

-- Check for future order dates
SELECT 'Orders with Future Dates', COUNT(*)
FROM orders
WHERE order_date > CURRENT_DATE + INTERVAL '1 day'

UNION ALL

-- Check for employees without any orders
SELECT 'Employees with No Orders', COUNT(*)
FROM employees e
LEFT JOIN orders o ON e.employee_id = o.employee_id
WHERE o.employee_id IS NULL;

SELECT 'All retail database queries completed successfully!' as status;
