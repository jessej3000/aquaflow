import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Droplet, 
  Users, 
  Package, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  FileText,
  ShoppingCart,
  MoreVertical,
  Map as MapIcon,
  UserPlus,
  Receipt,
  Leaf,
  ShieldCheck,
  Pencil,
  Trash2
} from 'lucide-react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const DASHBOARD_MOBILE_VIEW_KEY = 'dashboard_mobile_view';
const DASHBOARD_MOBILE_VIEW_EVENT = 'dashboard-mobile-view-change';

const isSidebarView = (value: string): value is SidebarView => {
  return [
    'dashboard',
    'deliveries',
    'customers',
    'branches',
    'inventory',
    'riders',
    'users',
    'quality',
    'settings',
  ].includes(value);
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

type SidebarView = 'dashboard' | 'deliveries' | 'customers' | 'branches' | 'inventory' | 'riders' | 'users' | 'quality' | 'settings';

interface BranchRow {
  id: number;
  unitId: string;
  name: string;
  address: string;
  contact: string;
  status: 'active' | 'inactive';
}

interface BranchFormState {
  unitId: string;
  name: string;
  address: string;
  contact: string;
}

interface CustomerRow {
  id: number;
  branchId: number | null;
  code: string;
  name: string;
  address: string;
  contact: string;
  geolocation: string;
  status: 'active' | 'inactive';
}

interface CustomerFormState {
  branchId: string;
  code: string;
  name: string;
  address: string;
  contact: string;
  geolocation: string;
}

interface InventoryRow {
  id: number;
  branchId: number | null;
  branchName: string;
  code: string;
  name: string;
  description: string;
  supplier: string;
  quantity: number;
  capacity: number;
  unitCost: number;
  sellingPrice: number;
  status: 'active' | 'inactive';
}

interface InventoryFormState {
  branchId: string;
  code: string;
  name: string;
  description: string;
  supplier: string;
  quantity: string;
  capacity: string;
  unitCost: string;
  sellingPrice: string;
}

interface RiderRow {
  id: number;
  branchId: number | null;
  branchName: string;
  name: string;
  contact: string;
  vehicle: string;
  ranking: number;
  joined: string;
  status: 'active' | 'inactive';
  geolocation: string;
}

interface RiderFormState {
  branchId: string;
  name: string;
  contact: string;
  vehicle: string;
  ranking: string;
  joined: string;
  geolocation: string;
}

interface OrderFormState {
  branchId: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  contactNumber: string;
  orderType: 'delivery' | 'pickup' | 'walk-in';
  containerType: '' | 'round' | 'slim' | 'distilled' | 'alkaline';
  containerSize: '' | '5' | '3' | '1';
  quantity: string;
  borrowedContainers: string;
  returnedContainers: string;
  unitPrice: string;
  discount: string;
  deliveryFee: string;
  amountPaid: string;
  paymentMethod: '' | 'cash' | 'gcash' | 'maya' | 'bank-transfer';
  deliveryDate: string;
  deliveryTimeSlot: '' | 'morning' | 'afternoon' | 'evening';
  deliveryNotes: string;
  priorityFlag: boolean;
}

interface OrderRow {
  id: number;
  orderNumber: string;
  customerName: string;
  orderType: 'delivery' | 'pickup' | 'walk-in';
  containerType: '' | 'round' | 'slim' | 'distilled' | 'alkaline';
  containerSize: number | null;
  deliveryDate: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  orderStatus: 'pending' | 'confirmed' | 'out-for-delivery' | 'delivered' | 'cancelled';
}

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff' | 'assistant';
  isActive: boolean;
  createdAt: string;
}

interface UserFormState {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff' | 'assistant';
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeView, setActiveView] = useState<SidebarView>('dashboard');
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [isBranchesLoading, setIsBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormState>({
    unitId: '',
    name: '',
    address: '',
    contact: '',
  });
  const [branchFormError, setBranchFormError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormState>({
    branchId: '',
    code: '',
    name: '',
    address: '',
    contact: '',
    geolocation: '',
  });
  const [customerFormError, setCustomerFormError] = useState<string | null>(null);
  const [customerBranchOptions, setCustomerBranchOptions] = useState<BranchRow[]>([]);

  const [inventories, setInventories] = useState<InventoryRow[]>([]);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<number[]>([]);
  const [isInventoriesLoading, setIsInventoriesLoading] = useState(false);
  const [inventoriesError, setInventoriesError] = useState<string | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(null);
  const [inventoryForm, setInventoryForm] = useState<InventoryFormState>({
    branchId: '',
    code: '',
    name: '',
    description: '',
    supplier: '',
    quantity: '0',
  });
  const [inventoryFormError, setInventoryFormError] = useState<string | null>(null);
  const [inventoryBranchOptions, setInventoryBranchOptions] = useState<BranchRow[]>([]);

  const [riders, setRiders] = useState<RiderRow[]>([]);
  const [selectedRiderIds, setSelectedRiderIds] = useState<number[]>([]);
  const [isRidersLoading, setIsRidersLoading] = useState(false);
  const [ridersError, setRidersError] = useState<string | null>(null);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [editingRiderId, setEditingRiderId] = useState<number | null>(null);
  const [riderForm, setRiderForm] = useState<RiderFormState>({
    branchId: '', name: '', contact: '', vehicle: '', ranking: '0', joined: '', geolocation: '',
  });
  const [riderFormError, setRiderFormError] = useState<string | null>(null);
  const [riderBranchOptions, setRiderBranchOptions] = useState<BranchRow[]>([]);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'' | 'delivery' | 'pickup' | 'walk-in'>('');
  const [containerTypeFilter, setContainerTypeFilter] = useState<'' | 'round' | 'slim' | 'distilled' | 'alkaline'>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [orderFormError, setOrderFormError] = useState<string | null>(null);
  const [orderBranchOptions, setOrderBranchOptions] = useState<BranchRow[]>([]);
  const emptyOrderForm = (): OrderFormState => ({
    branchId: '',
    orderNumber: '',
    customerName: '',
    deliveryAddress: '',
    contactNumber: '',
    orderType: 'delivery',
    containerType: '',
    containerSize: '',
    quantity: '1',
    borrowedContainers: '0',
    returnedContainers: '0',
    unitPrice: '0',
    discount: '0',
    deliveryFee: '0',
    amountPaid: '0',
    paymentMethod: '',
    deliveryDate: '',
    deliveryTimeSlot: '',
    deliveryNotes: '',
    priorityFlag: false,
  });
  const [orderForm, setOrderForm] = useState<OrderFormState>(emptyOrderForm);
  const [overviewBranchFilter, setOverviewBranchFilter] = useState<string>('');
  const [inventoryCapacity, setInventoryCapacity] = useState<{ capacity: number; demand: number } | null>(null);
  const [isInventoryCapacityLoading, setIsInventoryCapacityLoading] = useState(false);
  const [dailySales, setDailySales] = useState<{ day1: number; day2: number; day3: number; day4: number; day5: number; day6: number; day7: number } | null>(null);
  const [isDailySalesLoading, setIsDailySalesLoading] = useState(false);
  interface ActiveOrderRow { orderNumber: string; customerName: string | null; orderStatus: string; orderType: string; totalAmount: number; }
  const [activeOrders, setActiveOrders] = useState<ActiveOrderRow[]>([]);
  const [isActiveOrdersLoading, setIsActiveOrdersLoading] = useState(false);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>({ email: '', password: '', fullName: '', role: 'staff' });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const currentUserRole = (() => {
    try {
      const userText = localStorage.getItem('user');
      if (!userText) {
        return 'staff';
      }
      const user = JSON.parse(userText) as { role?: string };
      return user.role === 'admin' ? 'admin' : 'staff';
    } catch {
      return 'staff';
    }
  })();
  const isAdminUser = currentUserRole === 'admin';

  const getAuthToken = () => localStorage.getItem('access_token');

  const mapBranchFromApi = (item: any): BranchRow => ({
    id: Number(item.id),
    unitId: String(item.unit_id),
    name: item.name ?? '',
    address: item.address ?? '',
    contact: item.contact ?? '',
    status: item.status === 'inactive' ? 'inactive' : 'active',
  });

  const mapCustomerFromApi = (item: any): CustomerRow => ({
    id: Number(item.id),
    branchId: item.branch_id ? Number(item.branch_id) : null,
    code: String(item.code),
    name: item.name ?? '',
    address: item.address ?? '',
    contact: item.contact ?? '',
    geolocation: item.geolocation ?? '',
    status: item.status === 'inactive' ? 'inactive' : 'active',
  });

  const mapInventoryFromApi = (item: any): InventoryRow => ({
    id: Number(item.id),
    branchId: item.branch_id ? Number(item.branch_id) : null,
    branchName: item.branch_name ?? '',
    code: String(item.code),
    name: item.name ?? '',
    description: item.description ?? '',
    supplier: item.supplier ?? '',
    quantity: Number(item.quantity ?? 0),
    capacity: Number(item.capacity ?? 0),
    unitCost: Number(item.unit_cost ?? 0),
    sellingPrice: Number(item.selling_price ?? 0),
    status: item.status === 'inactive' ? 'inactive' : 'active',
  });

  const mapRiderFromApi = (item: any): RiderRow => ({
    id: Number(item.id),
    branchId: item.branch_id ? Number(item.branch_id) : null,
    branchName: item.branch_name ?? '',
    name: item.name ?? '',
    contact: item.contact ?? '',
    vehicle: item.vehicle ?? '',
    ranking: Number(item.ranking ?? 0),
    joined: item.joined ?? '',
    status: item.status === 'inactive' ? 'inactive' : 'active',
    geolocation: item.geolocation ?? '',
  });

  const mapOrderFromApi = (item: any): OrderRow => ({
    id: Number(item.id),
    orderNumber: String(item.order_number ?? ''),
    customerName: item.customer_name ?? 'Walk-in Customer',
    orderType: item.order_type ?? 'delivery',
    containerType: item.container_type ?? '',
    containerSize: item.container_size != null ? Number(item.container_size) : null,
    deliveryDate: item.delivery_date ?? '',
    quantity: Number(item.quantity ?? 0),
    totalAmount: Number(item.total_amount ?? 0),
    paymentStatus: item.payment_status ?? 'unpaid',
    orderStatus: item.order_status ?? 'pending',
  });

  const mapUserFromApi = (item: any): UserRow => ({
    id: String(item.id),
    email: item.email ?? '',
    fullName: item.full_name ?? '',
    role: (item.role ?? 'staff') as UserRow['role'],
    isActive: Boolean(item.is_active ?? true),
    createdAt: item.created_at ?? '',
  });

  const fetchBranches = async () => {
    const token = getAuthToken();
    if (!token) {
      setBranchesError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsBranchesLoading(true);
    setBranchesError(null);

    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setBranchesError(data.detail ?? 'Unable to load branches.');
        return;
      }

      const list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
      setBranches(list);
      setSelectedBranchIds([]);
    } catch {
      setBranchesError('Unable to reach the server.');
    } finally {
      setIsBranchesLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const token = getAuthToken();
    if (!token) {
      setCustomersError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsCustomersLoading(true);
    setCustomersError(null);

    try {
      let endpoint = `${API_BASE}/customers`;
      if (currentUserRole !== 'admin') {
        const branchRes = await fetch(`${API_BASE}/branches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!branchRes.ok) {
          setCustomersError('Unable to determine branch context.');
          setCustomers([]);
          setSelectedCustomerIds([]);
          return;
        }

        const branchData = await branchRes.json();
        const firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
        if (!firstBranch) {
          setCustomers([]);
          setSelectedCustomerIds([]);
          return;
        }

        endpoint = `${API_BASE}/customers?branch_id=${firstBranch.id}`;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setCustomersError(data.detail ?? 'Unable to load customers.');
        return;
      }

      const list = Array.isArray(data.customers) ? data.customers.map(mapCustomerFromApi) : [];
      setCustomers(list);
      setSelectedCustomerIds([]);
    } catch {
      setCustomersError('Unable to reach the server.');
    } finally {
      setIsCustomersLoading(false);
    }
  };

  const fetchInventories = async () => {
    const token = getAuthToken();
    if (!token) {
      setInventoriesError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsInventoriesLoading(true);
    setInventoriesError(null);

    try {
      let endpoint = `${API_BASE}/inventories`;
      if (currentUserRole !== 'admin') {
        const branchRes = await fetch(`${API_BASE}/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!branchRes.ok) {
          setInventoriesError('Unable to determine branch context.');
          setInventories([]);
          setSelectedInventoryIds([]);
          return;
        }

        const branchData = await branchRes.json();
        const firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
        if (!firstBranch) {
          setInventories([]);
          setSelectedInventoryIds([]);
          return;
        }

        endpoint = `${API_BASE}/inventories?branch_id=${firstBranch.id}`;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setInventoriesError(data.detail ?? 'Unable to load inventories.');
        return;
      }

      const list = Array.isArray(data.inventories) ? data.inventories.map(mapInventoryFromApi) : [];
      setInventories(list);
      setSelectedInventoryIds([]);
    } catch {
      setInventoriesError('Unable to reach the server.');
    } finally {
      setIsInventoriesLoading(false);
    }
  };

  const fetchRiders = async () => {
    const token = getAuthToken();
    if (!token) { setRidersError('You are not logged in.'); onNavigate('auth'); return; }
    setIsRidersLoading(true);
    setRidersError(null);
    try {
      const res = await fetch(`${API_BASE}/riders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }
      const data = await res.json();
      if (!res.ok) { setRidersError(data.detail ?? 'Unable to load riders.'); return; }
      const list = Array.isArray(data.riders) ? data.riders.map(mapRiderFromApi) : [];
      setRiders(list);
      setSelectedRiderIds([]);
    } catch {
      setRidersError('Unable to reach the server.');
    } finally {
      setIsRidersLoading(false);
    }
  };

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      setOrdersError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      let endpoint = `${API_BASE}/orders`;
      if (currentUserRole !== 'admin') {
        const branchRes = await fetch(`${API_BASE}/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!branchRes.ok) {
          setOrdersError('Unable to determine branch context.');
          setOrders([]);
          setSelectedOrderIds([]);
          return;
        }

        const branchData = await branchRes.json();
        const firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
        if (!firstBranch) {
          setOrders([]);
          setSelectedOrderIds([]);
          return;
        }

        endpoint = `${API_BASE}/orders?branch_id=${firstBranch.id}`;
      }

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setOrdersError(data.detail ?? 'Unable to load orders.');
        return;
      }

      const list = Array.isArray(data.orders) ? data.orders.map(mapOrderFromApi) : [];
      setOrders(list);
      setSelectedOrderIds([]);
    } catch {
      setOrdersError('Unable to reach the server.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = getAuthToken();
    if (!token) { setUsersError('You are not logged in.'); onNavigate('auth'); return; }
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }
      const data = await res.json();
      if (!res.ok) { setUsersError(data.detail ?? 'Unable to load users.'); return; }
      const list = Array.isArray(data.users) ? data.users.map(mapUserFromApi) : [];
      setUsers(list);
      setSelectedUserIds([]);
    } catch {
      setUsersError('Unable to reach the server.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleDeleteUsers = async () => {
    if (!selectedUserIds.length) return;
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      await Promise.all(
        selectedUserIds.map((id) =>
          fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        )
      );
      await fetchUsers();
    } catch {
      setUsersError('Failed to delete selected users.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setUsersError('Failed to delete user.'); return; }
      await fetchUsers();
    } catch {
      setUsersError('Failed to delete user.');
    }
  };

  const openAddUserModal = () => {
    setUserFormError(null);
    setEditingUserId(null);
    setUserForm({ email: '', password: '', fullName: '', role: 'staff' });
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserRow) => {
    setUserFormError(null);
    setEditingUserId(user.id);
    setUserForm({ email: user.email, password: '', fullName: user.fullName, role: user.role });
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUserId(null);
    setUserFormError(null);
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = userForm.email.trim().toLowerCase();
    if (!editingUserId && !normalizedEmail) { setUserFormError('Email is required.'); return; }
    if (!editingUserId && userForm.password.length < 8) {
      setUserFormError('Password must be at least 8 characters.');
      return;
    }
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const isEditing = editingUserId !== null;
      const endpoint = isEditing ? `${API_BASE}/users/${editingUserId}` : `${API_BASE}/users`;
      const method = isEditing ? 'PUT' : 'POST';
      const body: Record<string, any> = {
        full_name: userForm.fullName.trim() || undefined,
        role: userForm.role,
      };
      if (!isEditing) {
        body.email = normalizedEmail;
        body.password = userForm.password;
      }
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setUserFormError(data.detail ?? 'Failed to save user.'); return; }
      closeUserModal();
      await fetchUsers();
    } catch {
      setUserFormError('Unable to reach the server.');
    }
  };

  const fetchInventoryCapacity = async (branchId?: string) => {
    const token = getAuthToken();
    if (!token) return;
    setIsInventoryCapacityLoading(true);
    try {
      const args = branchId ? `(branchId: ${branchId})` : '';
      const body = JSON.stringify({
        query: `{ inventoryCapacity${args} { capacity demand } }`,
      });
      const res = await fetch(`${API_BASE}/gql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });
      const json = await res.json();
      const data = json?.data?.inventoryCapacity;
      if (data) {
        setInventoryCapacity({ capacity: Number(data.capacity), demand: Number(data.demand) });
      }
    } catch {
      // silently ignore and keep current card values
    } finally {
      setIsInventoryCapacityLoading(false);
    }
  };

  const fetchDailySales = async (branchId?: string) => {
    const token = getAuthToken();
    if (!token) return;
    setIsDailySalesLoading(true);
    try {
      const args = branchId ? `(branchId: ${branchId})` : '';
      const body = JSON.stringify({
        query: `{ dailySales${args} { day1 day2 day3 day4 day5 day6 day7 } }`,
      });
      const res = await fetch(`${API_BASE}/gql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });
      const json = await res.json();
      const data = json?.data?.dailySales;
      if (data) {
        setDailySales({
          day1: Number(data.day1 ?? 0),
          day2: Number(data.day2 ?? 0),
          day3: Number(data.day3 ?? 0),
          day4: Number(data.day4 ?? 0),
          day5: Number(data.day5 ?? 0),
          day6: Number(data.day6 ?? 0),
          day7: Number(data.day7 ?? 0),
        });
      }
    } catch {
      // silently ignore and keep current card values
    } finally {
      setIsDailySalesLoading(false);
    }
  };

  const fetchActiveOrders = async (branchId?: string) => {
    const token = getAuthToken();
    if (!token) return;
    setIsActiveOrdersLoading(true);
    try {
      const args = branchId ? `(branchId: ${branchId})` : '';
      const body = JSON.stringify({
        query: `{ activeOrders${args} { orderNumber customerName orderStatus orderType totalAmount } }`,
      });
      const res = await fetch(`${API_BASE}/gql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body,
      });
      const json = await res.json();
      const data = json?.data?.activeOrders;
      if (Array.isArray(data)) {
        setActiveOrders(
          data.map((o: any) => ({
            orderNumber: String(o.orderNumber),
            customerName: o.customerName ?? null,
            orderStatus: String(o.orderStatus),
            orderType: String(o.orderType),
            totalAmount: Number(o.totalAmount ?? 0),
          }))
        );
      }
    } catch {
      // silently ignore
    } finally {
      setIsActiveOrdersLoading(false);
    }
  };

  useEffect(() => {
    const requestedView = localStorage.getItem(DASHBOARD_MOBILE_VIEW_KEY);
    if (requestedView && isSidebarView(requestedView)) {
      setActiveView(requestedView);
    }
    localStorage.removeItem(DASHBOARD_MOBILE_VIEW_KEY);
  }, []);

  useEffect(() => {
    const handleMobileViewChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ view?: string }>;
      const requestedView = customEvent.detail?.view;
      if (requestedView && isSidebarView(requestedView)) {
        setActiveView(requestedView);
      }
    };

    window.addEventListener(DASHBOARD_MOBILE_VIEW_EVENT, handleMobileViewChange);
    return () => {
      window.removeEventListener(DASHBOARD_MOBILE_VIEW_EVENT, handleMobileViewChange);
    };
  }, []);

  useEffect(() => {
    if (activeView === 'deliveries') {
      void fetchOrders();
    }
    if (activeView === 'branches') {
      void fetchBranches();
    }
    if (activeView === 'dashboard' && isAdminUser) {
      void fetchBranches();
    }
    if (activeView === 'dashboard') {
      void fetchInventoryCapacity(overviewBranchFilter || undefined);
      void fetchDailySales(overviewBranchFilter || undefined);
      void fetchActiveOrders(overviewBranchFilter || undefined);
    }
    if (activeView === 'customers') {
      void fetchCustomers();
    }
    if (activeView === 'inventory') {
      void fetchInventories();
    }
    if (activeView === 'riders') {
      void fetchRiders();
    }
    if (activeView === 'users') {
      void fetchUsers();
    }
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      void fetchInventoryCapacity(overviewBranchFilter || undefined);
      void fetchDailySales(overviewBranchFilter || undefined);
      void fetchActiveOrders(overviewBranchFilter || undefined);
    }
  }, [overviewBranchFilter, activeView]);

  const allBranchesSelected = branches.length > 0 && selectedBranchIds.length === branches.length;
  const allCustomersSelected = customers.length > 0 && selectedCustomerIds.length === customers.length;
  const allInventoriesSelected = inventories.length > 0 && selectedInventoryIds.length === inventories.length;
  const allRidersSelected = riders.length > 0 && selectedRiderIds.length === riders.length;
  const allOrdersSelected = orders.length > 0 && selectedOrderIds.length === orders.length;
  const allUsersSelected = users.length > 0 && selectedUserIds.length === users.length;
  const filteredOrders = orders.filter((order) => {
    const orderDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
    if (orderDateFrom && (!orderDate || orderDate < new Date(orderDateFrom))) {
      return false;
    }
    if (orderDateTo && (!orderDate || orderDate > new Date(orderDateTo))) {
      return false;
    }
    if (orderTypeFilter && order.orderType !== orderTypeFilter) {
      return false;
    }
    if (containerTypeFilter && order.containerType !== containerTypeFilter) {
      return false;
    }
    return true;
  });

  const toggleSelectAllBranches = () => {
    if (allBranchesSelected) {
      setSelectedBranchIds([]);
      return;
    }
    setSelectedBranchIds(branches.map((branch) => branch.id));
  };

  const toggleBranchSelection = (branchId: number) => {
    setSelectedBranchIds((current) =>
      current.includes(branchId)
        ? current.filter((id) => id !== branchId)
        : [...current, branchId]
    );
  };

  const toggleSelectAllCustomers = () => {
    if (allCustomersSelected) {
      setSelectedCustomerIds([]);
      return;
    }
    setSelectedCustomerIds(customers.map((customer) => customer.id));
  };

  const toggleCustomerSelection = (customerId: number) => {
    setSelectedCustomerIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId]
    );
  };

  const toggleSelectAllInventories = () => {
    if (allInventoriesSelected) {
      setSelectedInventoryIds([]);
      return;
    }
    setSelectedInventoryIds(inventories.map((inv) => inv.id));
  };

  const toggleInventorySelection = (inventoryId: number) => {
    setSelectedInventoryIds((current) =>
      current.includes(inventoryId)
        ? current.filter((id) => id !== inventoryId)
        : [...current, inventoryId]
    );
  };

  const toggleSelectAllRiders = () => {
    if (allRidersSelected) { setSelectedRiderIds([]); return; }
    setSelectedRiderIds(riders.map((r) => r.id));
  };

  const toggleRiderSelection = (riderId: number) => {
    setSelectedRiderIds((current) =>
      current.includes(riderId) ? current.filter((id) => id !== riderId) : [...current, riderId]
    );
  };

  const toggleSelectAllOrders = () => {
    if (allOrdersSelected) {
      setSelectedOrderIds([]);
      return;
    }
    setSelectedOrderIds(orders.map((order) => order.id));
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]
    );
  };

  const toggleSelectAllUsers = () => {
    if (allUsersSelected) { setSelectedUserIds([]); return; }
    setSelectedUserIds(users.map((u) => u.id));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const handleDeleteBranches = async () => {
    if (!selectedBranchIds.length) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      await Promise.all(
        selectedBranchIds.map((branchId) =>
          fetch(`${API_BASE}/branches/${branchId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      await fetchBranches();
    } catch {
      setBranchesError('Failed to delete selected branches.');
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/branches/${branchId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setBranchesError('Failed to delete branch.');
        return;
      }

      await fetchBranches();
    } catch {
      setBranchesError('Failed to delete branch.');
    }
  };

  const handleDeleteCustomers = async () => {
    if (!selectedCustomerIds.length) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      await Promise.all(
        selectedCustomerIds.map((customerId) =>
          fetch(`${API_BASE}/customers/${customerId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );
      await fetchCustomers();
    } catch {
      setCustomersError('Failed to delete selected customers.');
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setCustomersError('Failed to delete customer.');
        return;
      }

      await fetchCustomers();
    } catch {
      setCustomersError('Failed to delete customer.');
    }
  };

  const toggleCustomerStatus = async (customerId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    const customer = customers.find((item) => item.id === customerId);
    if (!customer) {
      return;
    }

    const nextStatus = customer.status === 'active' ? 'inactive' : 'active';

    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        setCustomersError('Failed to update customer status.');
        return;
      }

      const data = await res.json();
      if (data.customer) {
        const updated = mapCustomerFromApi(data.customer);
        setCustomers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
    } catch {
      setCustomersError('Failed to update customer status.');
    }
  };

  const toggleBranchStatus = async (branchId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    const branch = branches.find((item) => item.id === branchId);
    if (!branch) {
      return;
    }

    const nextStatus = branch.status === 'active' ? 'inactive' : 'active';

    try {
      const res = await fetch(`${API_BASE}/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        setBranchesError('Failed to update branch status.');
        return;
      }

      const data = await res.json();
      if (data.branch) {
        const updated = mapBranchFromApi(data.branch);
        setBranches((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
    } catch {
      setBranchesError('Failed to update branch status.');
    }
  };

  const handleDeleteInventories = async () => {
    if (!selectedInventoryIds.length) return;
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      await Promise.all(
        selectedInventoryIds.map((id) =>
          fetch(`${API_BASE}/inventories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchInventories();
    } catch {
      setInventoriesError('Failed to delete selected inventories.');
    }
  };

  const handleDeleteInventory = async (inventoryId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/inventories/${inventoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setInventoriesError('Failed to delete inventory.'); return; }
      await fetchInventories();
    } catch {
      setInventoriesError('Failed to delete inventory.');
    }
  };

  const toggleInventoryStatus = async (inventoryId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    const inv = inventories.find((item) => item.id === inventoryId);
    if (!inv) return;
    const nextStatus = inv.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE}/inventories/${inventoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) { setInventoriesError('Failed to update inventory status.'); return; }
      const data = await res.json();
      if (data.inventory) {
        const updated = mapInventoryFromApi(data.inventory);
        setInventories((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
    } catch {
      setInventoriesError('Failed to update inventory status.');
    }
  };

  const fetchInventoryBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setInventoryFormError(data.detail ?? 'Unable to load branch options.'); return; }
      const list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
      setInventoryBranchOptions(list);
    } catch {
      setInventoryFormError('Unable to load branch options.');
    }
  };

  const openAddInventoryModal = () => {
    setInventoryFormError(null);
    setEditingInventoryId(null);
    setInventoryForm({ branchId: '', code: '', name: '', description: '', supplier: '', quantity: '0', capacity: '0', unitCost: '0', sellingPrice: '0' });
    if (isAdminUser) void fetchInventoryBranchOptions();
    setIsInventoryModalOpen(true);
  };

  const openEditInventoryModal = (inv: InventoryRow) => {
    setInventoryFormError(null);
    setEditingInventoryId(inv.id);
    setInventoryForm({
      branchId: inv.branchId ? String(inv.branchId) : '',
      code: inv.code,
      name: inv.name,
      description: inv.description,
      supplier: inv.supplier,
      quantity: String(inv.quantity),
      capacity: String(inv.capacity),
      unitCost: String(inv.unitCost),
      sellingPrice: String(inv.sellingPrice),
    });
    if (isAdminUser) void fetchInventoryBranchOptions();
    setIsInventoryModalOpen(true);
  };

  const closeInventoryModal = () => {
    setIsInventoryModalOpen(false);
    setEditingInventoryId(null);
    setInventoryFormError(null);
  };

  const handleInventorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedCode = inventoryForm.code.trim();
    const normalizedName = inventoryForm.name.trim();
    if (!normalizedCode) { setInventoryFormError('Code is required.'); return; }
    if (!normalizedName) { setInventoryFormError('Name is required.'); return; }
    const qty = Number(inventoryForm.quantity);
    if (isNaN(qty) || qty < 0) { setInventoryFormError('Quantity must be 0 or more.'); return; }
    const capacity = Number(inventoryForm.capacity);
    if (isNaN(capacity) || capacity < 0) { setInventoryFormError('Capacity must be 0 or more.'); return; }
    const unitCost = Number(inventoryForm.unitCost);
    if (isNaN(unitCost) || unitCost < 0) { setInventoryFormError('Unit cost must be 0 or more.'); return; }
    const sellingPrice = Number(inventoryForm.sellingPrice);
    if (isNaN(sellingPrice) || sellingPrice < 0) { setInventoryFormError('Selling price must be 0 or more.'); return; }
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(
        editingInventoryId ? `${API_BASE}/inventories/${editingInventoryId}` : `${API_BASE}/inventories`,
        {
          method: editingInventoryId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...(isAdminUser && inventoryForm.branchId ? { branch_id: Number(inventoryForm.branchId) } : {}),
            code: normalizedCode,
            name: normalizedName,
            description: inventoryForm.description.trim(),
            supplier: inventoryForm.supplier.trim(),
            quantity: qty,
            capacity,
            unit_cost: unitCost,
            selling_price: sellingPrice,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setInventoryFormError(data.detail ?? 'Failed to save inventory.'); return; }
      closeInventoryModal();
      await fetchInventories();
    } catch {
      setInventoryFormError('Unable to reach the server.');
    }
  };

  const handleDeleteRiders = async () => {
    if (!selectedRiderIds.length) return;
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      await Promise.all(
        selectedRiderIds.map((id) =>
          fetch(`${API_BASE}/riders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        )
      );
      await fetchRiders();
    } catch {
      setRidersError('Failed to delete selected riders.');
    }
  };

  const handleDeleteRider = async (riderId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/riders/${riderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setRidersError('Failed to delete rider.'); return; }
      await fetchRiders();
    } catch {
      setRidersError('Failed to delete rider.');
    }
  };

  const handleDeleteOrders = async () => {
    if (!selectedOrderIds.length) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      await Promise.all(
        selectedOrderIds.map((id) =>
          fetch(`${API_BASE}/orders/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchOrders();
    } catch {
      setOrdersError('Failed to delete selected orders.');
    }
  };

  const fetchOrderBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setOrderFormError(data.detail ?? 'Unable to load branch options.'); return; }
      setOrderBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
    } catch {
      setOrderFormError('Unable to load branch options.');
    }
  };

  const openOrderModal = () => {
    setEditingOrderId(null);
    setOrderFormError(null);
    setOrderForm(emptyOrderForm());
    if (isAdminUser) void fetchOrderBranchOptions();
    setIsOrderModalOpen(true);
  };

  const openEditOrderModal = async (orderId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    setOrderFormError(null);
    if (isAdminUser) {
      await fetchOrderBranchOptions();
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.order) {
        setOrderFormError(data.detail ?? 'Unable to load order details.');
        return;
      }

      const order = data.order;
      setEditingOrderId(orderId);
      setOrderForm({
        branchId: order.branch_id ? String(order.branch_id) : '',
        orderNumber: String(order.order_number ?? ''),
        customerName: order.customer_name ?? '',
        deliveryAddress: order.delivery_address ?? '',
        contactNumber: order.contact_number ?? '',
        orderType: (order.order_type ?? 'delivery') as OrderFormState['orderType'],
        containerType: (order.container_type ?? '') as OrderFormState['containerType'],
        containerSize: order.container_size != null ? String(order.container_size) as OrderFormState['containerSize'] : '',
        quantity: String(order.quantity ?? 0),
        borrowedContainers: String(order.borrowed_containers ?? 0),
        returnedContainers: String(order.returned_containers ?? 0),
        unitPrice: String(order.unit_price ?? 0),
        discount: String(order.discount ?? 0),
        deliveryFee: String(order.delivery_fee ?? 0),
        amountPaid: String(order.amount_paid ?? 0),
        paymentMethod: (order.payment_method ?? '') as OrderFormState['paymentMethod'],
        deliveryDate: order.delivery_date ?? '',
        deliveryTimeSlot: (order.delivery_time_slot ?? '') as OrderFormState['deliveryTimeSlot'],
        deliveryNotes: order.delivery_notes ?? '',
        priorityFlag: Boolean(order.priority_flag),
      });
      setIsOrderModalOpen(true);
    } catch {
      setOrderFormError('Unable to load order details.');
    }
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setEditingOrderId(null);
    setOrderFormError(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const num = orderForm.orderNumber.trim();
    if (!num) { setOrderFormError('Order number is required.'); return; }
    const qty = Number(orderForm.quantity);
    if (isNaN(qty) || qty < 0) { setOrderFormError('Quantity must be 0 or more.'); return; }
    const unitPrice = Number(orderForm.unitPrice);
    const discount = Number(orderForm.discount);
    const deliveryFee = Number(orderForm.deliveryFee);
    const amountPaid = Number(orderForm.amountPaid);
    const subtotal = qty * unitPrice;
    const total = Math.max(0, subtotal - discount + deliveryFee);
    const change = Math.max(0, amountPaid - total);
    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
    if (amountPaid >= total && total > 0) paymentStatus = 'paid';
    else if (amountPaid > 0) paymentStatus = 'partial';
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const body: Record<string, any> = {
        order_number: num,
        customer_name: orderForm.customerName.trim() || undefined,
        delivery_address: orderForm.deliveryAddress.trim() || undefined,
        contact_number: orderForm.contactNumber.trim() || undefined,
        order_type: orderForm.orderType,
        container_type: orderForm.containerType || undefined,
        container_size: orderForm.containerSize ? Number(orderForm.containerSize) : undefined,
        quantity: qty,
        borrowed_containers: Number(orderForm.borrowedContainers),
        returned_containers: Number(orderForm.returnedContainers),
        unit_price: unitPrice,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total_amount: total,
        amount_paid: amountPaid,
        change_amount: change,
        payment_method: orderForm.paymentMethod || undefined,
        payment_status: paymentStatus,
        delivery_date: orderForm.deliveryDate || undefined,
        delivery_time_slot: orderForm.deliveryTimeSlot || undefined,
        delivery_notes: orderForm.deliveryNotes.trim() || undefined,
        priority_flag: orderForm.priorityFlag,
      };
      if (isAdminUser && orderForm.branchId) body.branch_id = Number(orderForm.branchId);
      const isEditing = editingOrderId !== null;
      const endpoint = isEditing ? `${API_BASE}/orders/${editingOrderId}` : `${API_BASE}/orders`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setOrderFormError(data.detail ?? 'Failed to save order.'); return; }
      closeOrderModal();
      await fetchOrders();
    } catch {
      setOrderFormError('Unable to reach the server.');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setOrdersError('Failed to delete order.');
        return;
      }
      await fetchOrders();
    } catch {
      setOrdersError('Failed to delete order.');
    }
  };

  const toggleRiderStatus = async (riderId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;
    const nextStatus = rider.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE}/riders/${riderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) { setRidersError('Failed to update rider status.'); return; }
      const data = await res.json();
      if (data.rider) {
        const updated = mapRiderFromApi(data.rider);
        setRiders((current) => current.map((r) => (r.id === updated.id ? updated : r)));
      }
    } catch {
      setRidersError('Failed to update rider status.');
    }
  };

  const fetchRiderBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setRiderFormError(data.detail ?? 'Unable to load branch options.'); return; }
      setRiderBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
    } catch {
      setRiderFormError('Unable to load branch options.');
    }
  };

  const openAddRiderModal = () => {
    setRiderFormError(null);
    setEditingRiderId(null);
    setRiderForm({ branchId: '', name: '', contact: '', vehicle: '', ranking: '0', joined: '', geolocation: '' });
    void fetchRiderBranchOptions();
    setIsRiderModalOpen(true);
  };

  const openEditRiderModal = (rider: RiderRow) => {
    setRiderFormError(null);
    setEditingRiderId(rider.id);
    setRiderForm({
      branchId: rider.branchId ? String(rider.branchId) : '',
      name: rider.name,
      contact: rider.contact,
      vehicle: rider.vehicle,
      ranking: String(rider.ranking),
      joined: rider.joined ? String(rider.joined).slice(0, 10) : '',
      geolocation: rider.geolocation,
    });
    void fetchRiderBranchOptions();
    setIsRiderModalOpen(true);
  };

  const closeRiderModal = () => {
    setIsRiderModalOpen(false);
    setEditingRiderId(null);
    setRiderFormError(null);
  };

  const handleRiderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedName = riderForm.name.trim();
    if (!normalizedName) { setRiderFormError('Name is required.'); return; }
    const ranking = Number(riderForm.ranking);
    if (isNaN(ranking) || ranking < 0) { setRiderFormError('Ranking must be 0 or more.'); return; }
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(
        editingRiderId ? `${API_BASE}/riders/${editingRiderId}` : `${API_BASE}/riders`,
        {
          method: editingRiderId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...(riderForm.branchId ? { branch_id: Number(riderForm.branchId) } : {}),
            name: normalizedName,
            contact: riderForm.contact.trim(),
            vehicle: riderForm.vehicle.trim(),
            ranking,
            ...(riderForm.joined ? { joined: riderForm.joined } : {}),
            geolocation: riderForm.geolocation.trim(),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setRiderFormError(data.detail ?? 'Failed to save rider.'); return; }
      closeRiderModal();
      await fetchRiders();
    } catch {
      setRiderFormError('Unable to reach the server.');
    }
  };

  const openAddBranchModal = () => {
    setBranchFormError(null);
    setEditingBranchId(null);
    setBranchForm({ unitId: '', name: '', address: '', contact: '' });
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: BranchRow) => {
    setBranchFormError(null);
    setEditingBranchId(branch.id);
    setBranchForm({
      unitId: branch.unitId,
      name: branch.name,
      address: branch.address,
      contact: branch.contact,
    });
    setIsBranchModalOpen(true);
  };

  const closeAddBranchModal = () => {
    setIsBranchModalOpen(false);
    setEditingBranchId(null);
    setBranchFormError(null);
  };

  const fetchCustomerBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setCustomerFormError(data.detail ?? 'Unable to load branch options.');
        return;
      }

      const list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
      setCustomerBranchOptions(list);
    } catch {
      setCustomerFormError('Unable to load branch options.');
    }
  };

  const openAddCustomerModal = () => {
    setCustomerFormError(null);
    setEditingCustomerId(null);
    setCustomerForm({ branchId: '', code: '', name: '', address: '', contact: '', geolocation: '' });
    if (isAdminUser) {
      void fetchCustomerBranchOptions();
    }
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (customer: CustomerRow) => {
    setCustomerFormError(null);
    setEditingCustomerId(customer.id);
    setCustomerForm({
      branchId: customer.branchId ? String(customer.branchId) : '',
      code: customer.code,
      name: customer.name,
      address: customer.address,
      contact: customer.contact,
      geolocation: customer.geolocation,
    });
    if (isAdminUser) {
      void fetchCustomerBranchOptions();
    }
    setIsCustomerModalOpen(true);
  };

  const closeAddCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setEditingCustomerId(null);
    setCustomerFormError(null);
  };

  const handleAddBranchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedUnitId = branchForm.unitId.trim();
    const normalizedName = branchForm.name.trim();

    if (!/^[0-9]{5}$/.test(normalizedUnitId)) {
      setBranchFormError('Unit ID must be exactly 5 digits.');
      return;
    }

    if (!normalizedName) {
      setBranchFormError('Branch name is required.');
      return;
    }

    if (
      branches.some(
        (branch) => branch.unitId === normalizedUnitId && branch.id !== editingBranchId
      )
    ) {
      setBranchFormError('Unit ID already exists.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(
        editingBranchId ? `${API_BASE}/branches/${editingBranchId}` : `${API_BASE}/branches`,
        {
          method: editingBranchId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unit_id: normalizedUnitId,
          name: normalizedName,
          address: branchForm.address.trim(),
          contact: branchForm.contact.trim(),
          status: 'active',
        }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setBranchFormError(data.detail ?? 'Failed to save branch.');
        return;
      }

      closeAddBranchModal();
      await fetchBranches();
    } catch {
      setBranchFormError('Unable to reach the server.');
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedCode = customerForm.code.trim();
    const normalizedName = customerForm.name.trim();

    if (!/^[A-Za-z0-9]{8}$/.test(normalizedCode)) {
      setCustomerFormError('Code must be exactly 8 alphanumeric characters.');
      return;
    }

    if (!normalizedName) {
      setCustomerFormError('Customer name is required.');
      return;
    }

    if (
      customers.some(
        (customer) => customer.code.toLowerCase() === normalizedCode.toLowerCase() && customer.id !== editingCustomerId
      )
    ) {
      setCustomerFormError('Customer code already exists.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(
        editingCustomerId ? `${API_BASE}/customers/${editingCustomerId}` : `${API_BASE}/customers`,
        {
          method: editingCustomerId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...(isAdminUser && customerForm.branchId ? { branch_id: Number(customerForm.branchId) } : {}),
            code: normalizedCode,
            name: normalizedName,
            address: customerForm.address.trim(),
            contact: customerForm.contact.trim(),
            geolocation: customerForm.geolocation.trim(),
            status: 'active',
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setCustomerFormError(data.detail ?? 'Failed to save customer.');
        return;
      }

      closeAddCustomerModal();
      await fetchCustomers();
    } catch {
      setCustomerFormError('Unable to reach the server.');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 border-r sticky top-0 left-0 bg-slate-50 border-slate-200 flex-col py-6 font-medium">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-black text-primary tracking-tight">AquaFlow Admin</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Water Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'deliveries', icon: Truck, label: 'Orders' },
            { id: 'customers', icon: Users, label: 'Customers' },
            { id: 'branches', icon: MapIcon, label: 'Branches' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as SidebarView)}
              className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          <div className="my-3 border-t border-slate-200" />

          {[
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'riders', icon: Truck, label: 'Riders' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'quality', icon: Droplet, label: 'Water Quality' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as SidebarView)}
              className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-6">
          <button 
            onClick={() => onNavigate('new-delivery')}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Delivery
          </button>
          <div className="pt-6 border-t border-slate-200 space-y-1">
            <button className="w-full text-slate-500 hover:bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 transition-colors text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </button>
            <button 
              onClick={() => onNavigate('landing')}
              className="w-full text-slate-500 hover:bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-6 md:p-10 lg:p-12 overflow-y-auto">
        {activeView === 'deliveries' ? (
          <section>
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Order Management</p>
                <h2 className="text-4xl font-bold text-primary">Orders</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={toggleSelectAllOrders}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allOrdersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteOrders}
                    disabled={!selectedOrderIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={openOrderModal}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </header>

            {ordersError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {ordersError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <input
                    type="date"
                    value={orderDateFrom}
                    onChange={(e) => setOrderDateFrom(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                    aria-label="Filter from date"
                  />
                  <input
                    type="date"
                    value={orderDateTo}
                    onChange={(e) => setOrderDateTo(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                    aria-label="Filter to date"
                  />
                  <select
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value as '' | 'delivery' | 'pickup' | 'walk-in')}
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm bg-white"
                    aria-label="Filter by order type"
                  >
                    <option value="">All order types</option>
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                  <select
                    value={containerTypeFilter}
                    onChange={(e) => setContainerTypeFilter(e.target.value as '' | 'round' | 'slim' | 'distilled' | 'alkaline')}
                    className="px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm bg-white"
                    aria-label="Filter by container type"
                  >
                    <option value="">All container types</option>
                    <option value="round">Round</option>
                    <option value="slim">Slim</option>
                    <option value="distilled">Distilled</option>
                    <option value="alkaline">Alkaline</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Order #</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Delivery Date</th>
                      <th className="px-6 py-4">Order Type</th>
                      <th className="px-6 py-4">Container</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isOrdersLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">Loading orders...</td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">No orders found.</td>
                      </tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{order.customerName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{order.orderType}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                          {order.containerType
                            ? `${order.containerType}${order.containerSize ? ` (${order.containerSize} gal)` : ''}`
                            : order.containerSize
                              ? `${order.containerSize} gal`
                              : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{order.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { void openEditOrderModal(order.id); }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${order.orderNumber}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${order.orderNumber}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Modal */}
            {isOrderModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">{editingOrderId ? 'Edit Order' : 'Create Order'}</h3>
                    <button onClick={closeOrderModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
                  </div>
                  <form onSubmit={handleOrderSubmit} className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {isAdminUser && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Branch</label>
                          <select
                            value={orderForm.branchId}
                            onChange={e => setOrderForm(f => ({ ...f, branchId: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">Select branch…</option>
                            {orderBranchOptions.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Number *</label>
                        <input type="text" required value={orderForm.orderNumber}
                          onChange={e => setOrderForm(f => ({ ...f, orderNumber: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                        <input type="text" value={orderForm.customerName}
                          onChange={e => setOrderForm(f => ({ ...f, customerName: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                        <input type="text" value={orderForm.contactNumber}
                          onChange={e => setOrderForm(f => ({ ...f, contactNumber: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Address</label>
                        <input type="text" value={orderForm.deliveryAddress}
                          onChange={e => setOrderForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Type</label>
                        <select value={orderForm.orderType}
                          onChange={e => setOrderForm(f => ({ ...f, orderType: e.target.value as OrderFormState['orderType'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="delivery">Delivery</option>
                          <option value="pickup">Pickup</option>
                          <option value="walk-in">Walk-in</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Container Type</label>
                        <select value={orderForm.containerType}
                          onChange={e => setOrderForm(f => ({ ...f, containerType: e.target.value as OrderFormState['containerType'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="round">Round</option>
                          <option value="slim">Slim</option>
                          <option value="distilled">Distilled</option>
                          <option value="alkaline">Alkaline</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Container Size</label>
                        <select value={orderForm.containerSize}
                          onChange={e => setOrderForm(f => ({ ...f, containerSize: e.target.value as OrderFormState['containerSize'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="5">5 gal</option>
                          <option value="3">3 gal</option>
                          <option value="1">1 gal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                        <input type="number" min={0} value={orderForm.quantity}
                          onChange={e => setOrderForm(f => ({ ...f, quantity: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Borrowed Containers</label>
                        <input type="number" min={0} value={orderForm.borrowedContainers}
                          onChange={e => setOrderForm(f => ({ ...f, borrowedContainers: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Returned Containers</label>
                        <input type="number" min={0} value={orderForm.returnedContainers}
                          onChange={e => setOrderForm(f => ({ ...f, returnedContainers: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price</label>
                        <input type="number" min={0} step={0.01} value={orderForm.unitPrice}
                          onChange={e => setOrderForm(f => ({ ...f, unitPrice: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount</label>
                        <input type="number" min={0} step={0.01} value={orderForm.discount}
                          onChange={e => setOrderForm(f => ({ ...f, discount: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Fee</label>
                        <input type="number" min={0} step={0.01} value={orderForm.deliveryFee}
                          onChange={e => setOrderForm(f => ({ ...f, deliveryFee: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Paid</label>
                        <input type="number" min={0} step={0.01} value={orderForm.amountPaid}
                          onChange={e => setOrderForm(f => ({ ...f, amountPaid: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                        <select value={orderForm.paymentMethod}
                          onChange={e => setOrderForm(f => ({ ...f, paymentMethod: e.target.value as OrderFormState['paymentMethod'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="cash">Cash</option>
                          <option value="gcash">GCash</option>
                          <option value="maya">Maya</option>
                          <option value="bank-transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Date</label>
                        <input type="date" value={orderForm.deliveryDate}
                          onChange={e => setOrderForm(f => ({ ...f, deliveryDate: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Time Slot</label>
                        <select value={orderForm.deliveryTimeSlot}
                          onChange={e => setOrderForm(f => ({ ...f, deliveryTimeSlot: e.target.value as OrderFormState['deliveryTimeSlot'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select…</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Delivery Notes</label>
                        <textarea rows={2} value={orderForm.deliveryNotes}
                          onChange={e => setOrderForm(f => ({ ...f, deliveryNotes: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-3">
                        <input type="checkbox" id="orderPriorityFlag" checked={orderForm.priorityFlag}
                          onChange={e => setOrderForm(f => ({ ...f, priorityFlag: e.target.checked }))}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30" />
                        <label htmlFor="orderPriorityFlag" className="text-sm font-medium text-slate-700">Priority Order</label>
                      </div>
                    </div>

                    {orderFormError && (
                      <p className="mt-4 text-sm text-red-600 font-medium">{orderFormError}</p>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button type="button" onClick={closeOrderModal}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit"
                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
                        {editingOrderId ? 'Update Order' : 'Create Order'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'inventory' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Stock Management</p>
                <h2 className="text-4xl font-bold text-primary">Inventory</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllInventories}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allInventoriesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteInventories}
                    disabled={!selectedInventoryIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={openAddInventoryModal}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Add Inventory
                  </button>
                </div>
              </div>
            </header>

            {inventoriesError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {inventoriesError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Capacity</th>
                      <th className="px-6 py-4">Unit Cost</th>
                      <th className="px-6 py-4">Selling Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isInventoriesLoading ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-8 text-center text-sm text-slate-500">Loading inventories...</td>
                      </tr>
                    ) : inventories.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-8 text-center text-sm text-slate-500">No inventory items found.</td>
                      </tr>
                    ) : inventories.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInventoryIds.includes(inv.id)}
                            onChange={() => toggleInventorySelection(inv.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{inv.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{inv.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{inv.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{inv.capacity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.unitCost.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.sellingPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleInventoryStatus(inv.id)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                inv.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {inv.status}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditInventoryModal(inv)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${inv.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInventory(inv.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${inv.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isInventoryModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeInventoryModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingInventoryId ? 'Edit Inventory' : 'Add Inventory'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the inventory details below.</p>
                  </div>

                  <form onSubmit={handleInventorySubmit} className="px-6 py-5 space-y-4">
                    {inventoryFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {inventoryFormError}
                      </div>
                    )}

                    {isAdminUser && (
                      <div className="space-y-1">
                        <label htmlFor="inv-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select
                          id="inv-branch-id"
                          value={inventoryForm.branchId}
                          onChange={(e) => setInventoryForm((c) => ({ ...c, branchId: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                        >
                          <option value="">Auto-assign first branch</option>
                          {inventoryBranchOptions.map((b) => (
                            <option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="inv-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input
                        id="inv-code"
                        value={inventoryForm.code}
                        onChange={(e) => setInventoryForm((c) => ({ ...c, code: e.target.value }))}
                        placeholder="ITEM-001"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input
                        id="inv-name"
                        value={inventoryForm.name}
                        onChange={(e) => setInventoryForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Water Container 20L"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-description" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                      <input
                        id="inv-description"
                        value={inventoryForm.description}
                        onChange={(e) => setInventoryForm((c) => ({ ...c, description: e.target.value }))}
                        placeholder="Heavy-duty reusable container"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="inv-supplier" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Supplier</label>
                      <input
                        id="inv-supplier"
                        value={inventoryForm.supplier}
                        onChange={(e) => setInventoryForm((c) => ({ ...c, supplier: e.target.value }))}
                        placeholder="Supplier Co."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="inv-quantity" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</label>
                        <input
                          id="inv-quantity"
                          type="number"
                          min={0}
                          value={inventoryForm.quantity}
                          onChange={(e) => setInventoryForm((c) => ({ ...c, quantity: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="inv-capacity" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Capacity</label>
                        <input
                          id="inv-capacity"
                          type="number"
                          min={0}
                          value={inventoryForm.capacity}
                          onChange={(e) => setInventoryForm((c) => ({ ...c, capacity: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="inv-unit-cost" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Cost</label>
                        <input
                          id="inv-unit-cost"
                          type="number"
                          min={0}
                          step="0.01"
                          value={inventoryForm.unitCost}
                          onChange={(e) => setInventoryForm((c) => ({ ...c, unitCost: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="inv-selling-price" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selling Price</label>
                        <input
                          id="inv-selling-price"
                          type="number"
                          min={0}
                          step="0.01"
                          value={inventoryForm.sellingPrice}
                          onChange={(e) => setInventoryForm((c) => ({ ...c, sellingPrice: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeInventoryModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingInventoryId ? 'Update Inventory' : 'Save Inventory'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'riders' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Delivery Team</p>
                <h2 className="text-4xl font-bold text-primary">Riders</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllRiders}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allRidersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteRiders}
                    disabled={!selectedRiderIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={openAddRiderModal}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Add Rider
                  </button>
                </div>
              </div>
            </header>

            {ridersError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {ridersError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Vehicle</th>
                      <th className="px-6 py-4">Ranking</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isRidersLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">Loading riders...</td>
                      </tr>
                    ) : riders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">No riders found.</td>
                      </tr>
                    ) : riders.map((rider) => (
                      <tr key={rider.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRiderIds.includes(rider.id)}
                            onChange={() => toggleRiderSelection(rider.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{rider.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{rider.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{rider.contact}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{rider.vehicle}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{rider.ranking}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {rider.joined ? new Date(rider.joined).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleRiderStatus(rider.id)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                rider.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {rider.status}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditRiderModal(rider)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${rider.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRider(rider.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${rider.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isRiderModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeRiderModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingRiderId ? 'Edit Rider' : 'Add Rider'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the rider details below.</p>
                  </div>

                  <form onSubmit={handleRiderSubmit} className="px-6 py-5 space-y-4">
                    {riderFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {riderFormError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="rider-branch" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                      <select
                        id="rider-branch"
                        value={riderForm.branchId}
                        onChange={(e) => setRiderForm((c) => ({ ...c, branchId: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                      >
                        <option value="">No branch</option>
                        {riderBranchOptions.map((b) => (
                          <option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="rider-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input
                        id="rider-name"
                        value={riderForm.name}
                        onChange={(e) => setRiderForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Juan dela Cruz"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="rider-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                      <input
                        id="rider-contact"
                        value={riderForm.contact}
                        onChange={(e) => setRiderForm((c) => ({ ...c, contact: e.target.value }))}
                        placeholder="+63 900 000 0000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="rider-vehicle" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Vehicle</label>
                      <input
                        id="rider-vehicle"
                        value={riderForm.vehicle}
                        onChange={(e) => setRiderForm((c) => ({ ...c, vehicle: e.target.value }))}
                        placeholder="Motorcycle / Tricycle"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="rider-ranking" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ranking</label>
                        <input
                          id="rider-ranking"
                          type="number"
                          min={0}
                          value={riderForm.ranking}
                          onChange={(e) => setRiderForm((c) => ({ ...c, ranking: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="rider-joined" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date Joined</label>
                        <input
                          id="rider-joined"
                          type="date"
                          value={riderForm.joined}
                          onChange={(e) => setRiderForm((c) => ({ ...c, joined: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="rider-geolocation" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Geolocation</label>
                      <input
                        id="rider-geolocation"
                        value={riderForm.geolocation}
                        onChange={(e) => setRiderForm((c) => ({ ...c, geolocation: e.target.value }))}
                        placeholder="14.5995, 120.9842"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeRiderModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingRiderId ? 'Update Rider' : 'Save Rider'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'customers' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Customer Directory</p>
                <h2 className="text-4xl font-bold text-primary">Customers</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllCustomers}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allCustomersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteCustomers}
                    disabled={!selectedCustomerIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={openAddCustomerModal}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </header>

            {customersError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {customersError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Geolocation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isCustomersLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Loading customers...</td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No customers found.</td>
                      </tr>
                    ) : customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomerIds.includes(customer.id)}
                            onChange={() => toggleCustomerSelection(customer.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{customer.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{customer.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.address}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.contact}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{customer.geolocation}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCustomerStatus(customer.id)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                customer.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {customer.status}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditCustomerModal(customer)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${customer.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${customer.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isCustomerModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeAddCustomerModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingCustomerId ? 'Edit Customer' : 'Add Customer'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the customer details below.</p>
                  </div>

                  <form onSubmit={handleAddCustomerSubmit} className="px-6 py-5 space-y-4">
                    {customerFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {customerFormError}
                      </div>
                    )}

                    {isAdminUser && (
                      <div className="space-y-1">
                        <label htmlFor="customer-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select
                          id="customer-branch-id"
                          value={customerForm.branchId}
                          onChange={(e) => setCustomerForm((current) => ({ ...current, branchId: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                        >
                          <option value="">Auto-assign first branch</option>
                          {customerBranchOptions.map((branch) => (
                            <option key={branch.id} value={String(branch.id)}>
                              {branch.name || branch.unitId}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="customer-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input
                        id="customer-code"
                        value={customerForm.code}
                        onChange={(e) => setCustomerForm((current) => ({ ...current, code: e.target.value }))}
                        placeholder="AB12CD34"
                        maxLength={8}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input
                        id="customer-name"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm((current) => ({ ...current, name: e.target.value }))}
                        placeholder="Acme Industries"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-address" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address</label>
                      <input
                        id="customer-address"
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm((current) => ({ ...current, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                      <input
                        id="customer-contact"
                        value={customerForm.contact}
                        onChange={(e) => setCustomerForm((current) => ({ ...current, contact: e.target.value }))}
                        placeholder="+63 900 000 0000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="customer-geolocation" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Geolocation</label>
                      <input
                        id="customer-geolocation"
                        value={customerForm.geolocation}
                        onChange={(e) => setCustomerForm((current) => ({ ...current, geolocation: e.target.value }))}
                        placeholder="14.5995, 120.9842"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeAddCustomerModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingCustomerId ? 'Update Customer' : 'Save Customer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'users' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">User Management</p>
                <h2 className="text-4xl font-bold text-primary">Users</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllUsers}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allUsersSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  {isAdminUser && (
                    <button
                      onClick={handleDeleteUsers}
                      disabled={!selectedUserIds.length}
                      className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  )}
                  {isAdminUser && (
                    <button
                      onClick={openAddUserModal}
                      className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                    >
                      Add User
                    </button>
                  )}
                </div>
              </div>
            </header>

            {usersError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {usersError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isUsersLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Loading users...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">No users found.</td>
                      </tr>
                    ) : users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{user.fullName || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                            user.role === 'admin' ? 'bg-primary/10 text-primary' :
                            user.role === 'assistant' ? 'bg-secondary/10 text-secondary' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                            user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isAdminUser && (
                              <button
                                type="button"
                                onClick={() => openEditUserModal(user)}
                                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                aria-label={`Edit ${user.email}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {isAdminUser && (
                              <button
                                type="button"
                                onClick={() => { void handleDeleteUser(user.id); }}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                aria-label={`Delete ${user.email}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isUserModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeUserModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingUserId ? 'Edit User' : 'Add User'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the user details below.</p>
                  </div>

                  <form onSubmit={handleUserSubmit} className="px-6 py-5 space-y-4">
                    {userFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {userFormError}
                      </div>
                    )}

                    {!editingUserId && (
                      <div className="space-y-1">
                        <label htmlFor="user-email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email *</label>
                        <input
                          id="user-email"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm((c) => ({ ...c, email: e.target.value }))}
                          placeholder="user@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                    )}

                    {editingUserId && (
                      <div className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                        Email: <span className="font-bold">{userForm.email}</span>
                      </div>
                    )}

                    {!editingUserId && (
                      <div className="space-y-1">
                        <label htmlFor="user-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password *</label>
                        <input
                          id="user-password"
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm((c) => ({ ...c, password: e.target.value }))}
                          placeholder="Min 8 characters"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="user-full-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                      <input
                        id="user-full-name"
                        value={userForm.fullName}
                        onChange={(e) => setUserForm((c) => ({ ...c, fullName: e.target.value }))}
                        placeholder="Juan dela Cruz"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="user-role" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Role</label>
                      <select
                        id="user-role"
                        value={userForm.role}
                        onChange={(e) => setUserForm((c) => ({ ...c, role: e.target.value as UserFormState['role'] }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                      >
                        <option value="staff">Staff</option>
                        <option value="assistant">Assistant</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeUserModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingUserId ? 'Update User' : 'Add User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'branches' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Branch Directory</p>
                <h2 className="text-4xl font-bold text-primary">Branches</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllBranches}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allBranchesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteBranches}
                    disabled={!selectedBranchIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={openAddBranchModal}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Add Branch
                  </button>
                </div>
              </div>
            </header>

            {branchesError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {branchesError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-6 py-4">Unit ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Address</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isBranchesLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">Loading branches...</td>
                      </tr>
                    ) : branches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No branches found.</td>
                      </tr>
                    ) : branches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedBranchIds.includes(branch.id)}
                            onChange={() => toggleBranchSelection(branch.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{branch.unitId}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{branch.address}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{branch.contact}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleBranchStatus(branch.id)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${
                                branch.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {branch.status}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditBranchModal(branch)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${branch.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${branch.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isBranchModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeAddBranchModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingBranchId ? 'Edit Branch' : 'Add Branch'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the branch details below.</p>
                  </div>

                  <form onSubmit={handleAddBranchSubmit} className="px-6 py-5 space-y-4">
                    {branchFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {branchFormError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="branch-unit-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit ID</label>
                      <input
                        id="branch-unit-id"
                        value={branchForm.unitId}
                        onChange={(e) => setBranchForm((current) => ({ ...current, unitId: e.target.value }))}
                        placeholder="12345"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input
                        id="branch-name"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm((current) => ({ ...current, name: e.target.value }))}
                        placeholder="Central Branch"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-address" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address</label>
                      <input
                        id="branch-address"
                        value={branchForm.address}
                        onChange={(e) => setBranchForm((current) => ({ ...current, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="branch-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                      <input
                        id="branch-contact"
                        value={branchForm.contact}
                        onChange={(e) => setBranchForm((current) => ({ ...current, contact: e.target.value }))}
                        placeholder="+63 900 000 0000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeAddBranchModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingBranchId ? 'Update Branch' : 'Save Branch'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Owner Dashboard</p>
                <h2 className="text-4xl font-bold text-primary">Business Overview</h2>
                {isAdminUser && branches.length > 0 && (
                  <div className="mt-3">
                    <select
                      value={overviewBranchFilter}
                      onChange={e => setOverviewBranchFilter(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                    >
                      <option value="">All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
                <button 
                  onClick={() => onNavigate('new-delivery')}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  New Order
                </button>
              </div>
            </header>

        {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Daily Sales */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
          >
            {(() => {
              const series = dailySales
                ? [dailySales.day7, dailySales.day6, dailySales.day5, dailySales.day4, dailySales.day3, dailySales.day2, dailySales.day1]
                : [0, 0, 0, 0, 0, 0, 0];
              const maxValue = Math.max(...series, 1);
              const todaySales = dailySales?.day1 ?? 0;
              const sevenDayTotal = series.reduce((sum, value) => sum + value, 0);
              const fmtMoney = (v: number) =>
                v.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

              return (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Daily Sales</p>
                      <h3 className="text-3xl font-black text-primary mt-2">{fmtMoney(todaySales)}</h3>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black">
                      7D {fmtMoney(sevenDayTotal)}
                    </span>
                  </div>
                  {isDailySalesLoading ? (
                    <div className="h-20 w-full flex items-center justify-center">
                      <span className="text-sm text-slate-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="h-20 w-full flex items-end gap-1.5">
                      {series.map((value, i) => {
                        const height = Math.max(6, Math.round((value / maxValue) * 100));
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-t-sm transition-all duration-500 ${
                              i === 6 ? 'bg-primary' : 'bg-primary/20'
                            }`}
                            style={{ height: `${height}%` }}
                            title={`Day ${7 - i}: ${fmtMoney(value)}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>

          {/* Inventory Capacity */}
          {(() => {
            const cap = inventoryCapacity?.capacity ?? 0;
            const dem = inventoryCapacity?.demand ?? 0;
            const pct = cap > 0 ? Math.min(100, Math.round((dem / cap) * 100)) : 0;
            const circumference = 301.6;
            const dashOffset = circumference * (1 - pct / 100);
            const fmtGal = (v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k gal` : `${v} gal`;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className="h-full flex flex-col">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Demand VS Capacity</p>
                  {isInventoryCapacityLoading ? (
                    <div className="mt-6 flex items-center justify-center flex-grow">
                      <span className="text-sm text-slate-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center gap-8 flex-grow">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle className="text-slate-100" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                          <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: dashOffset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="text-secondary"
                            cx="56" cy="56" fill="transparent" r="48" stroke="currentColor"
                            strokeDasharray={String(circumference)} strokeWidth="8"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-primary">{pct}%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                          <span className="text-xs font-bold text-slate-700">Demand: {fmtGal(dem)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                          <span className="text-xs font-bold text-slate-700">Stock: {fmtGal(cap)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* System Health */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary text-white p-8 rounded-2xl shadow-xl shadow-primary/20 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-lg">System Health</h4>
              <ShieldCheck className="w-6 h-6 text-secondary-container" />
            </div>
            <div className="space-y-6 flex-grow">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-on-primary-container uppercase tracking-wider">
                  <span>Filtration Efficiency</span>
                  <span>99.8%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99.8%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-secondary-container h-full" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-on-primary-container uppercase tracking-wider">
                  <span>Delivery Fleet</span>
                  <span>Optimal</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="bg-secondary-container h-full" 
                  />
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all uppercase tracking-widest">
              View Technical Logs
            </button>
          </motion.div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Orders */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-primary">Active Orders</h3>
              <button className="text-secondary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                  <tr>
                    <th className="px-8 py-5">Order ID</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isActiveOrdersLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-xs text-slate-400">Loading...</td>
                    </tr>
                  ) : activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-8 text-center text-xs text-slate-400">No active orders</td>
                    </tr>
                  ) : activeOrders.map((order) => {
                    const initials = (order.customerName ?? 'N/A')
                      .split(' ')
                      .slice(0, 2)
                      .map((w: string) => w[0]?.toUpperCase() ?? '')
                      .join('');
                    const statusColorClass =
                      order.orderStatus === 'out-for-delivery' ? 'bg-blue-50 text-blue-600' :
                      order.orderStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                      order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-500';
                    return (
                      <tr key={order.orderNumber} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5 font-mono text-xs text-slate-500 tracking-tight">{order.orderNumber}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary text-[10px] font-black">
                              {initials}
                            </div>
                            <span className="text-sm font-bold text-primary">{order.customerName ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColorClass}`}>
                            {order.orderStatus.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs font-semibold text-slate-500 capitalize">{order.orderType.replace(/-/g, ' ')}</td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-xs font-bold text-primary">₱{order.totalAmount.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="font-bold text-primary mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Droplet, label: 'Test Quality', color: 'secondary' },
                  { icon: MapIcon, label: 'Fleet Map', color: 'primary' },
                  { icon: UserPlus, label: 'Add Lead', color: 'primary' },
                  { icon: Receipt, label: 'Send Invoice', color: 'primary' },
                ].map((action) => (
                  <button 
                    key={action.label}
                    className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl hover:border-secondary/30 hover:bg-surface-container transition-all group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container rounded-2xl p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-primary uppercase tracking-widest text-xs mb-3">Sustainability Goal</h4>
                <p className="text-xs text-primary/70 leading-relaxed font-bold mb-6">You're 200 gallons away from hitting this month's water conservation target.</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary">82%</span>
                  <div className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '82%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary" 
                    />
                  </div>
                </div>
              </div>
              <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-primary opacity-5 transform rotate-12" />
            </div>
          </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
