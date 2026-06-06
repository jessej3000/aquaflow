export type Page = 'landing' | 'auth' | 'signup' | 'dashboard' | 'new-delivery' | 'pos' | 'delivery' | 'subscription' | 'activate';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role?: 'admin' | 'staff' | 'assistant' | 'delivery';
}
