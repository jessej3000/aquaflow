INSERT INTO feature_flags (key, description, enabled) VALUES
  ('reports_enabled',          'Show the Reports section in the dashboard sidebar (admin only)',        TRUE),
  ('expenses_enabled',         'Allow expense logging in the Expense vs. Revenue report',               TRUE),
  ('graphql_enabled',          'Accept requests to the /gql GraphQL endpoint',                          TRUE),
  ('report_cash_collection',   'Cash Collection Report — enable after the report is built',             FALSE),
  ('report_revenue_trend',     'Revenue Trend Report — enable after the report is built',               FALSE),
  ('report_product_mix',       'Product / Container Sales Mix Report — enable after built',             FALSE),
  ('report_customer_retention','Customer Retention Report — enable after the report is built',          FALSE),
  ('report_driver_performance','Driver Performance Report — enable after the report is built',          FALSE),
  ('report_refill_ratio',      'Refill vs. New Container Ratio Report — enable after built',            FALSE)
ON CONFLICT (key) DO NOTHING;
