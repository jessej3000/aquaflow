CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,

  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  delivery_address TEXT,
  contact_number TEXT,

  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'walk-in')),
  container_type TEXT CHECK (container_type IN ('round', 'slim', 'distilled', 'alkaline')),
  container_size TEXT CHECK (container_size IN ('5 gal', '3 gal', '1 gal')),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  borrowed_containers INTEGER NOT NULL DEFAULT 0 CHECK (borrowed_containers >= 0),
  returned_containers INTEGER NOT NULL DEFAULT 0 CHECK (returned_containers >= 0),

  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  change_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (change_amount >= 0),
  payment_method TEXT CHECK (payment_method IN ('cash', 'gcash', 'maya', 'bank-transfer')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),

  delivery_date DATE,
  delivery_time_slot TEXT CHECK (delivery_time_slot IN ('morning', 'afternoon', 'evening')),
  rider_id BIGINT REFERENCES riders(id) ON DELETE SET NULL,
  delivery_notes TEXT,
  delivered_at TIMESTAMPTZ,

  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'out-for-delivery', 'delivered', 'cancelled')),
  cancellation_reason TEXT,
  priority_flag BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  branch_id BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
