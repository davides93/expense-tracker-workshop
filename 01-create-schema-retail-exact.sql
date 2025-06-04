-- Retail Database Schema - Exact Match to Image
-- Tables: Customers, Products, Orders, Employees
-- Created: 2025-06-04

-- =====================================================
-- DROP EXISTING SCHEMA (if needed for reset)
-- =====================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- =====================================================
-- CUSTOMERS TABLE
-- Exact fields from image: customerID, firstName, lastName, birthDate, moneySpent, anniversary
-- =====================================================
CREATE TABLE Customers (
    customerID SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    birthDate DATE,
    moneySpent DECIMAL(12,2) DEFAULT 0.00,
    anniversary DATE
);

-- =====================================================
-- EMPLOYEES TABLE  
-- Exact fields from image: employeeID, firstName, lastName, birthDate
-- =====================================================
CREATE TABLE Employees (
    employeeID SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    birthDate DATE
);

-- =====================================================
-- PRODUCTS TABLE
-- Exact fields from image: productID, category, price
-- =====================================================
CREATE TABLE Products (
    productID SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- =====================================================
-- ORDERS TABLE
-- Exact fields from image: orderID, customerID, employeeID, productID, orderTotal, orderDate
-- =====================================================
CREATE TABLE Orders (
    orderID SERIAL PRIMARY KEY,
    customerID INTEGER NOT NULL REFERENCES Customers(customerID) ON DELETE CASCADE,
    employeeID INTEGER REFERENCES Employees(employeeID) ON DELETE SET NULL,
    productID INTEGER NOT NULL REFERENCES Products(productID) ON DELETE CASCADE,
    orderTotal DECIMAL(12,2) NOT NULL CHECK (orderTotal >= 0),
    orderDate DATE NOT NULL DEFAULT CURRENT_DATE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer indexes
CREATE INDEX idx_customers_name ON Customers(lastName, firstName);
CREATE INDEX idx_customers_birth_date ON Customers(birthDate);
CREATE INDEX idx_customers_money_spent ON Customers(moneySpent DESC);

-- Employee indexes
CREATE INDEX idx_employees_name ON Employees(lastName, firstName);
CREATE INDEX idx_employees_birth_date ON Employees(birthDate);

-- Product indexes
CREATE INDEX idx_products_category ON Products(category);
CREATE INDEX idx_products_price ON Products(price);

-- Order indexes
CREATE INDEX idx_orders_customer_id ON Orders(customerID);
CREATE INDEX idx_orders_employee_id ON Orders(employeeID);
CREATE INDEX idx_orders_product_id ON Orders(productID);
CREATE INDEX idx_orders_date ON Orders(orderDate DESC);
CREATE INDEX idx_orders_total ON Orders(orderTotal DESC);

-- Composite indexes for common queries
CREATE INDEX idx_orders_customer_date ON Orders(customerID, orderDate DESC);
CREATE INDEX idx_orders_employee_date ON Orders(employeeID, orderDate DESC);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Function to update customer moneySpent when orders are added/updated/deleted
CREATE OR REPLACE FUNCTION update_customer_money_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE Customers 
        SET moneySpent = (
            SELECT COALESCE(SUM(orderTotal), 0) 
            FROM Orders 
            WHERE customerID = NEW.customerID
        )
        WHERE customerID = NEW.customerID;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE Customers 
        SET moneySpent = (
            SELECT COALESCE(SUM(orderTotal), 0) 
            FROM Orders 
            WHERE customerID = OLD.customerID
        )
        WHERE customerID = OLD.customerID;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_money_spent_insert
    AFTER INSERT ON Orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_money_spent();

CREATE TRIGGER trigger_update_money_spent_update
    AFTER UPDATE ON Orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_money_spent();

CREATE TRIGGER trigger_update_money_spent_delete
    AFTER DELETE ON Orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_money_spent();

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- Customer summary view
CREATE VIEW CustomerSummary AS
SELECT 
    c.customerID,
    c.firstName,
    c.lastName,
    c.birthDate,
    c.moneySpent,
    c.anniversary,
    COUNT(o.orderID) as totalOrders,
    MIN(o.orderDate) as firstOrderDate,
    MAX(o.orderDate) as lastOrderDate
FROM Customers c
LEFT JOIN Orders o ON c.customerID = o.customerID
GROUP BY c.customerID, c.firstName, c.lastName, c.birthDate, c.moneySpent, c.anniversary;

-- Employee performance view
CREATE VIEW EmployeePerformance AS
SELECT 
    e.employeeID,
    e.firstName,
    e.lastName,
    e.birthDate,
    COUNT(o.orderID) as totalOrdersProcessed,
    COALESCE(SUM(o.orderTotal), 0) as totalSalesAmount,
    COALESCE(AVG(o.orderTotal), 0) as averageOrderValue
FROM Employees e
LEFT JOIN Orders o ON e.employeeID = o.employeeID
GROUP BY e.employeeID, e.firstName, e.lastName, e.birthDate;

-- Product performance view
CREATE VIEW ProductPerformance AS
SELECT 
    p.productID,
    p.category,
    p.price,
    COUNT(o.orderID) as timesSold,
    COALESCE(SUM(o.orderTotal), 0) as totalRevenue,
    COALESCE(AVG(o.orderTotal), 0) as averageOrderValue
FROM Products p
LEFT JOIN Orders o ON p.productID = o.productID
GROUP BY p.productID, p.category, p.price;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE Customers IS 'Customer information with automatic money spent calculation';
COMMENT ON TABLE Employees IS 'Employee information';
COMMENT ON TABLE Products IS 'Product catalog with categories and pricing';
COMMENT ON TABLE Orders IS 'Order transactions linking customers, employees, and products';

COMMENT ON COLUMN Customers.moneySpent IS 'Automatically calculated total from all orders';
COMMENT ON COLUMN Orders.orderTotal IS 'Total amount for this order';
