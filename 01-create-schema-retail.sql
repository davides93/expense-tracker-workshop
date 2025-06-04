-- Retail/E-commerce Database Schema
-- Based on the provided schema image
-- Created: 2025-06-04

-- =====================================================
-- DROP EXISTING SCHEMA (if needed for reset)
-- =====================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    money_spent DECIMAL(12,2) DEFAULT 0.00,
    anniversary DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMPLOYEES TABLE
-- =====================================================
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    hire_date DATE DEFAULT CURRENT_DATE,
    department VARCHAR(100),
    salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    description TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    order_total DECIMAL(12,2) NOT NULL CHECK (order_total >= 0),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    order_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer indexes
CREATE INDEX idx_customers_name ON customers(last_name, first_name);
CREATE INDEX idx_customers_birth_date ON customers(birth_date);
CREATE INDEX idx_customers_money_spent ON customers(money_spent DESC);

-- Employee indexes
CREATE INDEX idx_employees_name ON employees(last_name, first_name);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);

-- Product indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_name ON products(product_name);

-- Order indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_employee_id ON orders(employee_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_date ON orders(order_date DESC);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_total ON orders(order_total DESC);

-- Composite indexes for common queries
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);
CREATE INDEX idx_orders_product_date ON orders(product_id, order_date DESC);
CREATE INDEX idx_orders_employee_date ON orders(employee_id, order_date DESC);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO UPDATE CUSTOMER MONEY SPENT
-- =====================================================
CREATE OR REPLACE FUNCTION update_customer_money_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add to customer's money_spent
        UPDATE customers 
        SET money_spent = money_spent + NEW.order_total 
        WHERE customer_id = NEW.customer_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust customer's money_spent
        UPDATE customers 
        SET money_spent = money_spent - OLD.order_total + NEW.order_total 
        WHERE customer_id = NEW.customer_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Subtract from customer's money_spent
        UPDATE customers 
        SET money_spent = money_spent - OLD.order_total 
        WHERE customer_id = OLD.customer_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update customer money_spent
CREATE TRIGGER trigger_update_customer_money_spent
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_money_spent();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Customer summary view
CREATE VIEW customer_summary AS
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.birth_date,
    c.anniversary,
    c.money_spent,
    COUNT(o.order_id) as total_orders,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date,
    AVG(o.order_total) as avg_order_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.birth_date, c.anniversary, c.money_spent;

-- Product sales summary
CREATE VIEW product_sales_summary AS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.price,
    p.stock_quantity,
    COUNT(o.order_id) as total_orders,
    SUM(o.quantity) as total_quantity_sold,
    SUM(o.order_total) as total_revenue,
    AVG(o.order_total) as avg_order_value
FROM products p
LEFT JOIN orders o ON p.product_id = o.product_id
GROUP BY p.product_id, p.product_name, p.category, p.price, p.stock_quantity;

-- Employee performance view
CREATE VIEW employee_performance AS
SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name AS full_name,
    e.department,
    COUNT(o.order_id) as total_orders_processed,
    SUM(o.order_total) as total_sales_value,
    AVG(o.order_total) as avg_order_value,
    MIN(o.order_date) as first_sale_date,
    MAX(o.order_date) as last_sale_date
FROM employees e
LEFT JOIN orders o ON e.employee_id = o.employee_id
GROUP BY e.employee_id, e.first_name, e.last_name, e.department;

-- Daily sales summary
CREATE VIEW daily_sales_summary AS
SELECT 
    order_date,
    COUNT(order_id) as total_orders,
    SUM(order_total) as total_revenue,
    AVG(order_total) as avg_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(DISTINCT product_id) as unique_products
FROM orders
GROUP BY order_date
ORDER BY order_date DESC;

-- =====================================================
-- CONSTRAINTS AND BUSINESS RULES
-- =====================================================

-- Ensure order total matches calculation (quantity * unit_price)
ALTER TABLE orders ADD CONSTRAINT check_order_total 
CHECK (order_total = quantity * unit_price);

-- Ensure birth dates are reasonable
ALTER TABLE customers ADD CONSTRAINT check_customer_birth_date 
CHECK (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE);

ALTER TABLE employees ADD CONSTRAINT check_employee_birth_date 
CHECK (birth_date >= '1900-01-01' AND birth_date <= CURRENT_DATE);

-- Ensure hire date is not in the future
ALTER TABLE employees ADD CONSTRAINT check_hire_date 
CHECK (hire_date <= CURRENT_DATE);

-- Ensure order date is not too far in the future
ALTER TABLE orders ADD CONSTRAINT check_order_date 
CHECK (order_date <= CURRENT_DATE + INTERVAL '1 day');

-- =====================================================
-- SAMPLE DATA CATEGORIES FOR PRODUCTS
-- =====================================================
COMMENT ON TABLE customers IS 'Customer information and purchase history';
COMMENT ON TABLE employees IS 'Employee information and sales performance';
COMMENT ON TABLE products IS 'Product catalog with pricing and inventory';
COMMENT ON TABLE orders IS 'Individual order transactions';

COMMENT ON COLUMN customers.money_spent IS 'Total amount spent by customer (automatically calculated)';
COMMENT ON COLUMN orders.order_total IS 'Total amount for this order (quantity * unit_price)';
COMMENT ON COLUMN products.stock_quantity IS 'Current inventory level';

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get customer age
CREATE OR REPLACE FUNCTION get_customer_age(customer_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    customer_birth_date DATE;
BEGIN
    SELECT birth_date INTO customer_birth_date 
    FROM customers 
    WHERE customer_id = customer_id_param;
    
    IF customer_birth_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN EXTRACT(YEAR FROM AGE(customer_birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to get years since hire for employee
CREATE OR REPLACE FUNCTION get_employee_tenure(employee_id_param INTEGER)
RETURNS DECIMAL(4,2) AS $$
DECLARE
    hire_date_val DATE;
BEGIN
    SELECT hire_date INTO hire_date_val 
    FROM employees 
    WHERE employee_id = employee_id_param;
    
    IF hire_date_val IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN ROUND(EXTRACT(EPOCH FROM AGE(hire_date_val)) / (365.25 * 24 * 3600), 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECURITY AND PERMISSIONS
-- =====================================================

-- Create roles for different access levels
CREATE ROLE retail_read_only;
CREATE ROLE retail_sales_user;
CREATE ROLE retail_manager;

-- Grant permissions to read-only role
GRANT USAGE ON SCHEMA public TO retail_read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO retail_read_only;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO retail_read_only;

-- Grant permissions to sales user role
GRANT USAGE ON SCHEMA public TO retail_sales_user;
GRANT SELECT, INSERT, UPDATE ON customers, orders TO retail_sales_user;
GRANT SELECT ON products, employees TO retail_sales_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO retail_sales_user;

-- Grant permissions to manager role
GRANT USAGE ON SCHEMA public TO retail_manager;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO retail_manager;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO retail_manager;

PRINT 'Retail database schema created successfully!';
PRINT 'Tables created: customers, employees, products, orders';
PRINT 'Views created: customer_summary, product_sales_summary, employee_performance, daily_sales_summary';
PRINT 'Functions created: update_customer_money_spent, get_customer_age, get_employee_tenure';
