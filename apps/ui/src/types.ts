export type Page = 'landing' | 'auth' | 'dashboard' | 'new-delivery';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role?: 'admin' | 'staff';
}
