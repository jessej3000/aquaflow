CREATE TABLE IF NOT EXISTS sales (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,

  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,

  product_id BIGINT REFERENCES inventories(id) ON DELETE SET NULL,
  product_name TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  CHECK (discount <= (quantity * unit_price)),
  line_total NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount) STORED,

  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'PHP' CHECK (currency ~ '^[A-Z]{3}$'),
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial', 'failed')),

  salesperson_id UUID REFERENCES users(id) ON DELETE SET NULL,
  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('online', 'walk-in', 'phone', 'social', 'other')),

  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sale_status TEXT NOT NULL DEFAULT 'pending' CHECK (sale_status IN ('completed', 'cancelled', 'refunded', 'pending')),

  notes TEXT,
  reference_number TEXT,

  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE (tenant_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON sales(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_sale_status ON sales(sale_status);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_reference_number ON sales(reference_number);
