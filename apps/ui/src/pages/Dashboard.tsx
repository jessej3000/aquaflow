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
  FileText,
  MoreVertical,
  Map as MapIcon,
  UserPlus,
  Receipt,
  Leaf,
  ShieldCheck,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  X,
  Zap,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Page } from '../types';
import PaymentModal from '../components/PaymentModal';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const ORDERS_PER_PAGE = 10;
const DASHBOARD_MOBILE_VIEW_KEY = 'dashboard_mobile_view';
const DASHBOARD_MOBILE_VIEW_EVENT = 'dashboard-mobile-view-change';

const isSidebarView = (value: string): value is SidebarView => {
  return [
    'dashboard',
    'deliveries',
    'sales',
    'customers',
    'branches',
    'inventory',
    'products',
    'users',
    'quality',
    'settings',
  ].includes(value);
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

type SidebarView = 'dashboard' | 'deliveries' | 'sales' | 'customers' | 'branches' | 'inventory' | 'products' | 'users' | 'quality' | 'settings';

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

interface ProductComponent {
  id: number;
  code: string;
  name: string;
  description: string;
  unit_cost: number;
  quantity: number;
}

interface ProductRow {
  id: number;
  branchId: number | null;
  branchName: string;
  code: string;
  name: string;
  description: string;
  unitPrice: number;
  components: ProductComponent[] | string;
}

interface ProductFormState {
  branchId: string;
  code: string;
  name: string;
  description: string;
  unitPrice: string;
}

interface MaintenanceRow {
  id: number;
  branchId: number | null;
  branchName: string;
  code: string;
  name: string;
  supplier: string;
  contact: string;
  expirationDays: number;
  dateReplaced: string;
  userName: string;
}

interface MaintenanceFormState {
  branchId: string;
  code: string;
  name: string;
  supplier: string;
  contact: string;
  expirationDays: string;
  dateReplaced: string;
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

interface SaleRow {
  id: number;
  invoiceNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial' | 'failed';
  saleStatus: 'pending' | 'completed' | 'cancelled' | 'refunded';
  saleDate: string;
}

interface SaleFormState {
  branchId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
  shippingFee: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial' | 'failed';
  saleStatus: 'pending' | 'completed' | 'cancelled' | 'refunded';
  saleDate: string;
  notes: string;
  referenceNumber: string;
}

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff' | 'assistant' | 'delivery';
  isActive: boolean;
  branchName?: string | null;
  createdAt: string;
  incentive: boolean | null;
}

interface UserFormState {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff' | 'assistant' | 'delivery';
  branchId: string;
}

const SUBSCRIPTION_PLANS = [
  {
    key: 'entry' as const,
    name: 'Entry',
    monthlyPrice: 49,
    yearlyPrice: 490,
    accent: 'text-primary',
    accentBg: 'bg-primary/5',
    accentBorder: 'border-primary/40',
    icon: 'zap',
    features: ['1 branch', 'Up to 500 orders / month', 'Basic analytics', 'Email support'],
  },
  {
    key: 'mid' as const,
    name: 'Mid',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    accent: 'text-violet-700',
    accentBg: 'bg-violet-50',
    accentBorder: 'border-violet-200',
    icon: 'star',
    features: ['Unlimited branches', 'Unlimited orders', 'Advanced analytics', 'Priority support'],
  },
] as const;

type SubscriptionPlanKey = typeof SUBSCRIPTION_PLANS[number]['key'];

interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expiring_soon' | 'expired';
  plan_type: SubscriptionPlanKey;
  billing_cycle: 'monthly' | 'yearly';
  end_date: string;
  days_remaining: number;
}

const BILLING_PAYMENT_METHODS = [
  {
    key: 'cash' as const,
    label: 'Cash',
    sublabel: 'In-person cash payments',
    badge: '₱',
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-emerald-200',
    activeText: 'text-emerald-700',
    required: true,
  },
  {
    key: 'gcash' as const,
    label: 'GCash',
    sublabel: 'Pay via GCash e-wallet',
    badge: 'G',
    activeBg: 'bg-[#007DFE]/10',
    activeBorder: 'border-[#007DFE]/30',
    activeText: 'text-[#007DFE]',
    required: false,
  },
  {
    key: 'maya' as const,
    label: 'Maya',
    sublabel: 'Pay via Maya e-wallet',
    badge: 'M',
    activeBg: 'bg-[#3AC47D]/10',
    activeBorder: 'border-[#3AC47D]/30',
    activeText: 'text-[#3AC47D]',
    required: false,
  },
  {
    key: 'card' as const,
    label: 'Credit / Debit Card',
    sublabel: 'Visa, Mastercard, JCB',
    badge: '💳',
    activeBg: 'bg-slate-100',
    activeBorder: 'border-slate-300',
    activeText: 'text-slate-700',
    required: false,
  },
  {
    key: 'grab_pay' as const,
    label: 'GrabPay',
    sublabel: 'Pay via GrabPay wallet',
    badge: 'GP',
    activeBg: 'bg-[#00B14F]/10',
    activeBorder: 'border-[#00B14F]/30',
    activeText: 'text-[#00B14F]',
    required: false,
  },
];

type BillingPaymentKey = typeof BILLING_PAYMENT_METHODS[number]['key'];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeView, setActiveView] = useState<SidebarView>('dashboard');
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [branchPage, setBranchPage] = useState(1);
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
  const [customerPage, setCustomerPage] = useState(1);
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
  const [inventoryPage, setInventoryPage] = useState(1);
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

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({ branchId: '', code: '', name: '', description: '', unitPrice: '0' });
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productBranchOptions, setProductBranchOptions] = useState<BranchRow[]>([]);
  const [productComponents, setProductComponents] = useState<ProductComponent[]>([]);
  const [productComponentToAdd, setProductComponentToAdd] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [maintenance, setMaintenance] = useState<MaintenanceRow[]>([]);
  const [selectedMaintenanceIds, setSelectedMaintenanceIds] = useState<number[]>([]);
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<number | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceFormState>({
    branchId: '',
    code: '',
    name: '',
    supplier: '',
    contact: '',
    expirationDays: '0',
    dateReplaced: '',
  });
  const [maintenanceFormError, setMaintenanceFormError] = useState<string | null>(null);
  const [maintenanceBranchOptions, setMaintenanceBranchOptions] = useState<BranchRow[]>([]);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [selectedSaleIds, setSelectedSaleIds] = useState<number[]>([]);
  const [salePage, setSalePage] = useState(1);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [saleFormError, setSaleFormError] = useState<string | null>(null);
  const [saleBranchOptions, setSaleBranchOptions] = useState<BranchRow[]>([]);
  const emptySaleForm = (): SaleFormState => ({
    branchId: '',
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    productName: '',
    quantity: '1',
    unitPrice: '0',
    discount: '0',
    taxRate: '0',
    shippingFee: '0',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    saleStatus: 'pending',
    saleDate: '',
    notes: '',
    referenceNumber: '',
  });
  const [saleForm, setSaleForm] = useState<SaleFormState>(emptySaleForm);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
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
  const [userPage, setUserPage] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>({ email: '', password: '', fullName: '', role: 'staff', branchId: '' });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userBranchOptions, setUserBranchOptions] = useState<BranchRow[]>([]);

  const [paymentTarget, setPaymentTarget] = useState<{
    orderId: number;
    amount: number;
    description: string;
    customerName: string;
  } | null>(null);

  const getInitialSettingsName = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') ?? '{}') as { full_name?: string };
      return u.full_name ?? '';
    } catch { return ''; }
  };
  const [settingsName, setSettingsName] = useState(getInitialSettingsName);
  const [settingsNameSaving, setSettingsNameSaving] = useState(false);
  const [settingsNameMessage, setSettingsNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [settingsPasswordSaving, setSettingsPasswordSaving] = useState(false);
  const [settingsPasswordMessage, setSettingsPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showUpgradePlan, setShowUpgradePlan] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeBillingCycle, setSubscribeBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const fetchSubscription = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setSubscriptionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json() as SubscriptionStatus;
        setSubscription(data);
      }
    } catch { /* silent */ } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async (planKey: SubscriptionPlanKey) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setSubscribeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscription/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_type: planKey, billing_cycle: subscribeBillingCycle }),
      });
      const data = await res.json() as { checkout_url?: string; detail?: string };
      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch { /* silent */ } finally {
      setSubscribeLoading(false);
    }
  };

  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<Set<BillingPaymentKey>>(() => {
    try {
      const stored = localStorage.getItem('wm_accepted_payment_methods');
      if (stored) return new Set(JSON.parse(stored) as BillingPaymentKey[]);
    } catch {}
    return new Set<BillingPaymentKey>(['cash']);
  });

  const togglePaymentMethod = (key: BillingPaymentKey) => {
    setEnabledPaymentMethods((prev: Set<BillingPaymentKey>) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      localStorage.setItem('wm_accepted_payment_methods', JSON.stringify([...next]));
      return next;
    });
  };

  const currentUserRole = (() => {
    try {
      const userText = localStorage.getItem('user');
      if (!userText) {
        return 'staff';
      }
      const user = JSON.parse(userText) as { role?: string };
      return user.role === 'admin' ? 'admin' : (user.role as string) ?? 'staff';
    } catch {
      return 'staff';
    }
  })();

  const currentUserBranchId = (() => {
    try {
      const userText = localStorage.getItem('user');
      if (!userText) return null;
      const user = JSON.parse(userText) as { branch_id?: number | null };
      return user?.branch_id ?? null;
    } catch {
      return null;
    }
  })();
  const currentUserId = (() => {
    try {
      const userText = localStorage.getItem('user');
      if (!userText) {
        return '';
      }
      const user = JSON.parse(userText) as { id?: string };
      return String(user.id ?? '');
    } catch {
      return '';
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

  const mapProductFromApi = (item: any): ProductRow => ({
    id: Number(item.id),
    branchId: item.branch_id ? Number(item.branch_id) : null,
    branchName: item.branch_name ?? '',
    code: String(item.code ?? ''),
    name: item.name ?? '',
    description: item.description ?? '',
    unitPrice: Number(item.unit_price ?? 0),
    components: item.components ?? [],
  });

  const mapMaintenanceFromApi = (item: any): MaintenanceRow => ({
    id: Number(item.id),
    branchId: item.branch_id ? Number(item.branch_id) : null,
    branchName: item.branch_name ?? '',
    code: String(item.code),
    name: item.name ?? '',
    supplier: item.supplier ?? '',
    contact: item.contact ?? '',
    expirationDays: Number(item.expiration_days ?? 0),
    dateReplaced: item.date_replaced ?? '',
    userName: item.user_name ?? '',
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

  const mapSaleFromApi = (item: any): SaleRow => ({
    id: Number(item.id),
    invoiceNumber: String(item.invoice_number ?? ''),
    customerName: item.customer_name ?? 'Walk-in Customer',
    productName: item.product_name ?? '—',
    quantity: Number(item.quantity ?? 0),
    totalAmount: Number(item.total_amount ?? 0),
    paymentStatus: (item.payment_status ?? 'pending') as SaleRow['paymentStatus'],
    saleStatus: (item.sale_status ?? 'pending') as SaleRow['saleStatus'],
    saleDate: item.sale_date ?? item.created_at ?? '',
  });

  const mapUserFromApi = (item: any): UserRow => ({
    id: String(item.id),
    email: item.email ?? '',
    fullName: item.full_name ?? '',
    role: (item.role ?? 'staff') as UserRow['role'],
    isActive: Boolean(item.is_active ?? true),
    branchName: item.branch_name ?? null,
    createdAt: item.created_at ?? '',
    incentive: item.incentive ?? null,
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
        if (!currentUserBranchId) {
          setCustomersError('No branch assigned to your account.');
          setCustomers([]);
          setSelectedCustomerIds([]);
          return;
        }
        endpoint = `${API_BASE}/customers?branch_id=${currentUserBranchId}`;
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
        if (!currentUserBranchId) {
          setInventoriesError('No branch assigned to your account.');
          setInventories([]);
          setSelectedInventoryIds([]);
          return;
        }

        endpoint = `${API_BASE}/inventories?branch_id=${currentUserBranchId}`;
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

  const fetchProducts = async () => {
    const token = getAuthToken();
    if (!token) {
      setProductsError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsProductsLoading(true);
    setProductsError(null);

    try {
      let endpoint = `${API_BASE}/products`;
      if (currentUserRole !== 'admin') {
        if (!currentUserBranchId) {
          setProductsError('No branch assigned to your account.');
          setProducts([]);
          return;
        }
        endpoint = `${API_BASE}/products?branch_id=${currentUserBranchId}`;
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
        setProductsError(data.detail ?? 'Unable to load products.');
        return;
      }

      const list = Array.isArray(data.products) ? data.products.map(mapProductFromApi) : [];
      setProducts(list);
      setSelectedProductIds([]);
    } catch {
      setProductsError('Unable to reach the server.');
    } finally {
      setIsProductsLoading(false);
    }
  };

  const allProductsSelected = products.length > 0 && selectedProductIds.length === products.length;

  const toggleSelectAllProducts = () => {
    setSelectedProductIds((current) => (current.length === products.length ? [] : products.map((product) => product.id)));
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const openEditProduct = (product: ProductRow) => {
    setEditingProductId(product.id);
    setProductFormError(null);
    setProductForm({
      branchId: product.branchId ? String(product.branchId) : '',
      code: product.code,
      name: product.name,
      description: product.description,
      unitPrice: String(product.unitPrice ?? 0),
    });
    setProductComponents(Array.isArray(product.components) ? product.components : []);
    setProductComponentToAdd('');
    if (isAdminUser) void fetchProductBranchOptions();
    if (!inventories.length) void fetchInventories();
    setIsProductModalOpen(true);
  };

  const handleDeleteProducts = async () => {
    if (!selectedProductIds.length) return;

    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }

    try {
      const deleteResponses = await Promise.all(
        selectedProductIds.map((id) =>
          fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );

      if (deleteResponses.some((res) => !res.ok)) {
        setProductsError('Failed to delete selected products.');
        return;
      }

      setProducts((current) => current.filter((product) => !selectedProductIds.includes(product.id)));
      setSelectedProductIds([]);
    } catch {
      setProductsError('Failed to delete selected products.');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }

    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setProductsError('Failed to delete product.');
        return;
      }

      setProducts((current) => current.filter((product) => product.id !== productId));
      setSelectedProductIds((current) => current.filter((id) => id !== productId));
    } catch {
      setProductsError('Failed to delete product.');
    }
  };

  const fetchMaintenance = async () => {
    const token = getAuthToken();
    if (!token) {
      setMaintenanceError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsMaintenanceLoading(true);
    setMaintenanceError(null);

    try {
      let endpoint = `${API_BASE}/maintenance`;
      if (currentUserRole !== 'admin') {
        if (!currentUserBranchId) {
          setMaintenanceError('No branch assigned to your account.');
          setMaintenance([]);
          setSelectedMaintenanceIds([]);
          return;
        }
        endpoint = `${API_BASE}/maintenance?branch_id=${currentUserBranchId}`;
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
        setMaintenanceError(data.detail ?? 'Unable to load maintenance items.');
        return;
      }

      const list = Array.isArray(data.maintenance) ? data.maintenance.map(mapMaintenanceFromApi) : [];
      setMaintenance(list);
      setSelectedMaintenanceIds([]);
    } catch {
      setMaintenanceError('Unable to reach the server.');
    } finally {
      setIsMaintenanceLoading(false);
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
        if (!currentUserBranchId) {
          setOrdersError('No branch assigned to your account.');
          setOrders([]);
          setSelectedOrderIds([]);
          return;
        }
        endpoint = `${API_BASE}/orders?branch_id=${currentUserBranchId}`;
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

  const fetchSales = async () => {
    const token = getAuthToken();
    if (!token) {
      setSalesError('You are not logged in.');
      onNavigate('auth');
      return;
    }

    setIsSalesLoading(true);
    setSalesError(null);

    try {
      let endpoint = `${API_BASE}/sales`;
      if (currentUserRole !== 'admin') {
        if (!currentUserBranchId) {
          setSalesError('No branch assigned to your account.');
          setSales([]);
          setSelectedSaleIds([]);
          return;
        }
        endpoint = `${API_BASE}/sales?branch_id=${currentUserBranchId}`;
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
        setSalesError(data.detail ?? 'Unable to load sales.');
        return;
      }

      const list = Array.isArray(data.sales) ? data.sales.map(mapSaleFromApi) : [];
      setSales(list);
      setSelectedSaleIds([]);
    } catch {
      setSalesError('Unable to reach the server.');
    } finally {
      setIsSalesLoading(false);
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
      const list = Array.isArray(data.users)
        ? data.users.map(mapUserFromApi).filter((u) => u.id !== currentUserId)
        : [];
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
    if (!window.confirm(`Delete ${selectedUserIds.length} selected user(s)? This cannot be undone.`)) return;
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

  const handleIncentiveToggle = async (user: UserRow) => {
    const token = getAuthToken();
    if (!token) return;
    const newVal = !user.incentive;
    setUsers((prev: UserRow[]) => prev.map((u: UserRow) => u.id === user.id ? { ...u, incentive: newVal } : u));
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ incentive: newVal }),
      });
      if (!res.ok) {
        setUsers((prev: UserRow[]) => prev.map((u: UserRow) => u.id === user.id ? { ...u, incentive: user.incentive } : u));
      }
    } catch {
      setUsers((prev: UserRow[]) => prev.map((u: UserRow) => u.id === user.id ? { ...u, incentive: user.incentive } : u));
    }
  };

  const handleToggleUserActive = async (user: UserRow) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !user.isActive }),
      });
      if (!res.ok) { setUsersError(`Failed to ${user.isActive ? 'deactivate' : 'activate'} user.`); return; }
      await fetchUsers();
    } catch {
      setUsersError(`Failed to ${user.isActive ? 'deactivate' : 'activate'} user.`);
    }
  };

  const handleToggleSelectedUsersActive = async () => {
    if (!selectedUserIds.length) return;
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    const selectedUsers = users.filter((u: UserRow) => selectedUserIds.includes(u.id));
    const shouldActivate = selectedUsers.some((u: UserRow) => !u.isActive);
    try {
      const results = await Promise.all(
        selectedUserIds.map((id: string) =>
          fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ is_active: shouldActivate }),
          })
        )
      );
      if (results.some((res: Response) => !res.ok)) {
        setUsersError('Failed to update selected users.');
      }
      await fetchUsers();
    } catch {
      setUsersError('Failed to update selected users.');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Delete user ${userEmail}? This cannot be undone.`)) return;
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

  const fetchUserBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { setUserFormError('You are not logged in.'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setUserFormError(data.detail ?? 'Unable to load branch options.'); return; }
      setUserBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
    } catch {
      setUserFormError('Unable to load branch options.');
    }
  };

  const openAddUserModal = () => {
    setUserFormError(null);
    setEditingUserId(null);
    setUserForm({ email: '', password: '', fullName: '', role: 'staff', branchId: '' });
    if (isAdminUser) {
      void fetchUserBranchOptions();
    }
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserRow) => {
    setUserFormError(null);
    setEditingUserId(user.id);
    setUserForm({ email: user.email, password: '', fullName: user.fullName, role: user.role, branchId: '' });
    if (isAdminUser) {
      void fetchUserBranchOptions();
    }
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
      if (isAdminUser && userForm.branchId) {
        body.branch_id = Number(userForm.branchId);
      }
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

  const handleSaveProfileName = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    setSettingsNameSaving(true);
    setSettingsNameMessage(null);
    try {
      const res = await fetch(`${API_BASE}/users/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: settingsName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsNameMessage({ type: 'error', text: data.detail ?? 'Failed to update name.' });
        return;
      }
      const updatedName = data.user?.full_name ?? settingsName;
      setSettingsName(updatedName);
      const stored = JSON.parse(localStorage.getItem('user') ?? '{}') as Record<string, unknown>;
      localStorage.setItem('user', JSON.stringify({ ...stored, full_name: updatedName }));
      setSettingsNameMessage({ type: 'success', text: 'Name updated successfully.' });
    } catch {
      setSettingsNameMessage({ type: 'error', text: 'Unable to reach the server.' });
    } finally {
      setSettingsNameSaving(false);
    }
  };

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (settingsNewPassword !== settingsConfirmPassword) {
      setSettingsPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    setSettingsPasswordSaving(true);
    setSettingsPasswordMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: settingsCurrentPassword, new_password: settingsNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsPasswordMessage({ type: 'error', text: data.detail ?? 'Failed to change password.' });
        return;
      }
      setSettingsCurrentPassword('');
      setSettingsNewPassword('');
      setSettingsConfirmPassword('');
      setSettingsPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch {
      setSettingsPasswordMessage({ type: 'error', text: 'Unable to reach the server.' });
    } finally {
      setSettingsPasswordSaving(false);
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
    void fetchSubscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (activeView === 'sales') {
      void fetchSales();
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
    if (activeView === 'products') {
      void fetchProducts();
    }
    if (activeView === 'quality') {
      void fetchMaintenance();
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
  const allOrdersSelected = orders.length > 0 && selectedOrderIds.length === orders.length;
  const allSalesSelected = sales.length > 0 && selectedSaleIds.length === sales.length;
  const allMaintenanceSelected = maintenance.length > 0 && selectedMaintenanceIds.length === maintenance.length;
  const allUsersSelected = users.length > 0 && selectedUserIds.length === users.length;
  const totalProductPages = Math.max(1, Math.ceil(products.length / ORDERS_PER_PAGE));
  const paginatedProducts = products.slice(
    (productPage - 1) * ORDERS_PER_PAGE,
    productPage * ORDERS_PER_PAGE,
  );
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
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ORDERS_PER_PAGE,
    orderPage * ORDERS_PER_PAGE,
  );
  const totalCustomerPages = Math.max(1, Math.ceil(customers.length / ORDERS_PER_PAGE));
  const paginatedCustomers = customers.slice(
    (customerPage - 1) * ORDERS_PER_PAGE,
    customerPage * ORDERS_PER_PAGE,
  );
  const totalBranchPages = Math.max(1, Math.ceil(branches.length / ORDERS_PER_PAGE));
  const paginatedBranches = branches.slice(
    (branchPage - 1) * ORDERS_PER_PAGE,
    branchPage * ORDERS_PER_PAGE,
  );
  const totalInventoryPages = Math.max(1, Math.ceil(inventories.length / ORDERS_PER_PAGE));
  const paginatedInventories = inventories.slice(
    (inventoryPage - 1) * ORDERS_PER_PAGE,
    inventoryPage * ORDERS_PER_PAGE,
  );
  const totalUserPages = Math.max(1, Math.ceil(users.length / ORDERS_PER_PAGE));
  const paginatedUsers = users.slice(
    (userPage - 1) * ORDERS_PER_PAGE,
    userPage * ORDERS_PER_PAGE,
  );
  const totalMaintenancePages = Math.max(1, Math.ceil(maintenance.length / ORDERS_PER_PAGE));
  const paginatedMaintenance = maintenance.slice(
    (maintenancePage - 1) * ORDERS_PER_PAGE,
    maintenancePage * ORDERS_PER_PAGE,
  );
  const totalSalePages = Math.max(1, Math.ceil(sales.length / ORDERS_PER_PAGE));
  const paginatedSales = sales.slice(
    (salePage - 1) * ORDERS_PER_PAGE,
    salePage * ORDERS_PER_PAGE,
  );

  useEffect(() => {
    setOrderPage(1);
  }, [orderDateFrom, orderDateTo, orderTypeFilter, containerTypeFilter]);

  useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages);
    }
  }, [orderPage, totalOrderPages]);

  useEffect(() => {
    setCustomerPage(1);
  }, [customers.length]);

  useEffect(() => {
    if (customerPage > totalCustomerPages) {
      setCustomerPage(totalCustomerPages);
    }
  }, [customerPage, totalCustomerPages]);

  useEffect(() => {
    setBranchPage(1);
  }, [branches.length]);

  useEffect(() => {
    if (branchPage > totalBranchPages) {
      setBranchPage(totalBranchPages);
    }
  }, [branchPage, totalBranchPages]);

  useEffect(() => {
    setInventoryPage(1);
  }, [inventories.length]);

  useEffect(() => {
    if (inventoryPage > totalInventoryPages) {
      setInventoryPage(totalInventoryPages);
    }
  }, [inventoryPage, totalInventoryPages]);

  useEffect(() => {
    setProductPage(1);
  }, [products.length]);

  useEffect(() => {
    if (productPage > totalProductPages) {
      setProductPage(totalProductPages);
    }
  }, [productPage, totalProductPages]);

  useEffect(() => {
    setMaintenancePage(1);
  }, [maintenance.length]);

  useEffect(() => {
    if (maintenancePage > totalMaintenancePages) {
      setMaintenancePage(totalMaintenancePages);
    }
  }, [maintenancePage, totalMaintenancePages]);

  useEffect(() => {
    setUserPage(1);
  }, [users.length]);

  useEffect(() => {
    if (userPage > totalUserPages) {
      setUserPage(totalUserPages);
    }
  }, [userPage, totalUserPages]);

  useEffect(() => {
    setSalePage(1);
  }, [sales.length]);

  useEffect(() => {
    if (salePage > totalSalePages) {
      setSalePage(totalSalePages);
    }
  }, [salePage, totalSalePages]);

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

  const toggleSelectAllMaintenance = () => {
    if (allMaintenanceSelected) {
      setSelectedMaintenanceIds([]);
      return;
    }
    setSelectedMaintenanceIds(maintenance.map((item) => item.id));
  };

  const toggleMaintenanceSelection = (maintenanceId: number) => {
    setSelectedMaintenanceIds((current) =>
      current.includes(maintenanceId)
        ? current.filter((id) => id !== maintenanceId)
        : [...current, maintenanceId]
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

  const toggleSelectAllSales = () => {
    if (allSalesSelected) {
      setSelectedSaleIds([]);
      return;
    }
    setSelectedSaleIds(sales.map((sale) => sale.id));
  };

  const toggleSaleSelection = (saleId: number) => {
    setSelectedSaleIds((current) =>
      current.includes(saleId) ? current.filter((id) => id !== saleId) : [...current, saleId]
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

  const handleDeleteMaintenances = async () => {
    if (!selectedMaintenanceIds.length) return;
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      await Promise.all(
        selectedMaintenanceIds.map((id) =>
          fetch(`${API_BASE}/maintenance/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchMaintenance();
    } catch {
      setMaintenanceError('Failed to delete selected maintenance records.');
    }
  };

  const handleDeleteMaintenance = async (maintenanceId: number) => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/maintenance/${maintenanceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setMaintenanceError('Failed to delete maintenance record.'); return; }
      await fetchMaintenance();
    } catch {
      setMaintenanceError('Failed to delete maintenance record.');
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

  const fetchMaintenanceBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setMaintenanceFormError(data.detail ?? 'Unable to load branch options.'); return; }
      const list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
      setMaintenanceBranchOptions(list);
    } catch {
      setMaintenanceFormError('Unable to load branch options.');
    }
  };

  const openAddInventoryModal = () => {
    setInventoryFormError(null);
    setEditingInventoryId(null);
    setInventoryForm({ branchId: '', code: '', name: '', description: '', supplier: '', quantity: '0', capacity: '0', unitCost: '0', sellingPrice: '0' });
    if (isAdminUser) void fetchInventoryBranchOptions();
    setIsInventoryModalOpen(true);
  };

  const fetchProductBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setProductFormError(data.detail ?? 'Unable to load branch options.'); return; }
      const list = Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : [];
      setProductBranchOptions(list);
    } catch {
      setProductFormError('Unable to load branch options.');
    }
  };

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductFormError(null);
    setProductForm({ branchId: '', code: '', name: '', description: '', unitPrice: '0' });
    setProductComponentToAdd('');
    setProductComponents([]);
    if (isAdminUser) void fetchProductBranchOptions();
    if (!inventories.length) void fetchInventories();
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };

  const getTotalComponentCost = () => {
    return productComponents.reduce((sum, component) => sum + (component.unit_cost * component.quantity), 0);
  };

  const handleProductSubmit = async (event: any) => {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }

    setProductFormError(null);
    const unitPrice = Number(productForm.unitPrice || 0);
    const totalComponentCost = getTotalComponentCost();

    // Validate unit price against total component cost
    if (productComponents.length > 0 && unitPrice < totalComponentCost) {
      setProductFormError(`Unit price must be at least ₱${totalComponentCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (total of all components).`);
      return;
    }

    const branchId = productForm.branchId ? Number(productForm.branchId) : undefined;
    const components = productComponents.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      unit_cost: item.unit_cost,
      quantity: item.quantity,
    }));

    try {
      const isEditing = editingProductId !== null;
      const endpoint = isEditing ? `${API_BASE}/products/${editingProductId}` : `${API_BASE}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branch_id: branchId,
          code: productForm.code,
          name: productForm.name,
          description: productForm.description,
          unit_price: Number(productForm.unitPrice || 0),
          components,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setProductFormError(data.detail ?? (isEditing ? 'Unable to update product.' : 'Unable to save product.'));
        return;
      }

      const updatedProduct = data.product ? {
        ...mapProductFromApi(data.product),
        code: data.product.code ?? productForm.code,
      } : {
        id: editingProductId ?? Date.now(),
        branchId: branchId ?? null,
        branchName: productBranchOptions.find((b) => b.id === branchId)?.name ?? '',
        code: productForm.code,
        name: productForm.name,
        description: productForm.description,
        unitPrice: Number(productForm.unitPrice || 0),
        components,
      };

      setProducts((current) =>
        isEditing
          ? current.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
          : [updatedProduct, ...current],
      );

      setIsProductModalOpen(false);
      setEditingProductId(null);
      setProductForm({ branchId: '', code: '', name: '', description: '', unitPrice: '0' });
      setProductComponents([]);
      setProductComponentToAdd('');
    } catch {
      setProductFormError('Unable to reach the server.');
    }
  };

  const openAddMaintenanceModal = () => {
    setEditingMaintenanceId(null);
    setMaintenanceFormError(null);
    setMaintenanceForm({ branchId: '', code: '', name: '', supplier: '', contact: '', expirationDays: '0', dateReplaced: '' });
    if (isAdminUser) void fetchMaintenanceBranchOptions();
    setIsMaintenanceModalOpen(true);
  };

  const openEditMaintenanceModal = (item: MaintenanceRow) => {
    setEditingMaintenanceId(item.id);
    setMaintenanceFormError(null);
    setMaintenanceForm({
      branchId: item.branchId ? String(item.branchId) : '',
      code: item.code,
      name: item.name,
      supplier: item.supplier ?? '',
      contact: item.contact ?? '',
      expirationDays: String(item.expirationDays ?? 0),
      dateReplaced: item.dateReplaced || '',
    });
    if (isAdminUser) void fetchMaintenanceBranchOptions();
    setIsMaintenanceModalOpen(true);
  };

  const closeMaintenanceModal = () => {
    setIsMaintenanceModalOpen(false);
    setEditingMaintenanceId(null);
    setMaintenanceFormError(null);
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedCode = maintenanceForm.code.trim();
    const normalizedName = maintenanceForm.name.trim();
    if (!normalizedCode) { setMaintenanceFormError('Code is required.'); return; }
    if (!normalizedName) { setMaintenanceFormError('Name is required.'); return; }
    const expirationDays = Number(maintenanceForm.expirationDays);
    if (isNaN(expirationDays) || expirationDays < 0) { setMaintenanceFormError('Expiration days must be 0 or more.'); return; }

    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }

    try {
      const method = editingMaintenanceId ? 'PUT' : 'POST';
      const url = editingMaintenanceId ? `${API_BASE}/maintenance/${editingMaintenanceId}` : `${API_BASE}/maintenance`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...(isAdminUser && maintenanceForm.branchId ? { branch_id: Number(maintenanceForm.branchId) } : {}),
          code: normalizedCode,
          name: normalizedName,
          supplier: maintenanceForm.supplier.trim() || null,
          contact: maintenanceForm.contact.trim() || null,
          expiration_days: expirationDays,
          date_replaced: maintenanceForm.dateReplaced || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMaintenanceFormError(data.detail ?? (editingMaintenanceId ? 'Failed to update maintenance item.' : 'Failed to add maintenance item.')); return; }
      closeMaintenanceModal();
      await fetchMaintenance();
    } catch {
      setMaintenanceFormError('Unable to reach the server.');
    }
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

  const handleDeleteSales = async () => {
    if (!selectedSaleIds.length) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      await Promise.all(
        selectedSaleIds.map((id) =>
          fetch(`${API_BASE}/sales/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchSales();
    } catch {
      setSalesError('Failed to delete selected sales.');
    }
  };

  const handleDeleteSale = async (saleId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sales/${saleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setSalesError('Failed to delete sale.');
        return;
      }
      await fetchSales();
    } catch {
      setSalesError('Failed to delete sale.');
    }
  };

  const fetchSaleBranchOptions = async () => {
    const token = getAuthToken();
    if (!token) { onNavigate('auth'); return; }
    try {
      const res = await fetch(`${API_BASE}/branches`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setSaleFormError(data.detail ?? 'Unable to load branch options.'); return; }
      setSaleBranchOptions(Array.isArray(data.branches) ? data.branches.map(mapBranchFromApi) : []);
    } catch {
      setSaleFormError('Unable to load branch options.');
    }
  };

  const openCreateSaleModal = async () => {
    setEditingSaleId(null);
    setSaleFormError(null);
    const now = new Date();
    const invoiceSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const invoiceNumber = `INV-${now.getFullYear()}-${invoiceSuffix}`;
    setSaleForm({
      ...emptySaleForm(),
      invoiceNumber,
      saleDate: now.toISOString().slice(0, 10),
    });
    if (isAdminUser) {
      await fetchSaleBranchOptions();
    }
    setIsSaleModalOpen(true);
  };

  const openEditSaleModal = async (saleId: number) => {
    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    setSaleFormError(null);
    if (isAdminUser) {
      await fetchSaleBranchOptions();
    }

    try {
      const res = await fetch(`${API_BASE}/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.sale) {
        setSaleFormError(data.detail ?? 'Unable to load sale details.');
        return;
      }

      const sale = data.sale;
      const saleDate = sale.sale_date ? String(sale.sale_date).slice(0, 10) : '';

      setEditingSaleId(saleId);
      setSaleForm({
        branchId: sale.branch_id ? String(sale.branch_id) : '',
        invoiceNumber: String(sale.invoice_number ?? ''),
        customerName: sale.customer_name ?? '',
        customerEmail: sale.customer_email ?? '',
        productName: sale.product_name ?? '',
        quantity: String(sale.quantity ?? 1),
        unitPrice: String(sale.unit_price ?? 0),
        discount: String(sale.discount ?? 0),
        taxRate: String(sale.tax_rate ?? 0),
        shippingFee: String(sale.shipping_fee ?? 0),
        paymentMethod: sale.payment_method ?? 'cash',
        paymentStatus: (sale.payment_status ?? 'pending') as SaleFormState['paymentStatus'],
        saleStatus: (sale.sale_status ?? 'pending') as SaleFormState['saleStatus'],
        saleDate,
        notes: sale.notes ?? '',
        referenceNumber: sale.reference_number ?? '',
      });
      setIsSaleModalOpen(true);
    } catch {
      setSaleFormError('Unable to load sale details.');
    }
  };

  const closeSaleModal = () => {
    setIsSaleModalOpen(false);
    setEditingSaleId(null);
    setSaleFormError(null);
  };

  const handleSaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
      onNavigate('auth');
      return;
    }

    const invoiceNumber = saleForm.invoiceNumber.trim();
    if (!invoiceNumber) {
      setSaleFormError('Invoice number is required.');
      return;
    }

    const quantity = Number(saleForm.quantity);
    const unitPrice = Number(saleForm.unitPrice);
    const discount = Number(saleForm.discount);
    const taxRate = Number(saleForm.taxRate);
    const shippingFee = Number(saleForm.shippingFee);

    if (isNaN(quantity) || quantity <= 0) {
      setSaleFormError('Quantity must be greater than 0.');
      return;
    }
    if (isNaN(unitPrice) || unitPrice < 0 || isNaN(discount) || discount < 0 || isNaN(taxRate) || taxRate < 0 || isNaN(shippingFee) || shippingFee < 0) {
      setSaleFormError('Amounts must be valid positive values.');
      return;
    }

    const subtotal = quantity * unitPrice - discount;
    if (subtotal < 0) {
      setSaleFormError('Discount cannot exceed quantity × unit price.');
      return;
    }
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + shippingFee;

    const payload: Record<string, any> = {
      invoice_number: invoiceNumber,
      customer_name: saleForm.customerName.trim() || undefined,
      customer_email: saleForm.customerEmail.trim() || undefined,
      product_name: saleForm.productName.trim() || undefined,
      quantity,
      unit_price: unitPrice,
      discount,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      currency: 'PHP',
      payment_method: saleForm.paymentMethod.trim() || undefined,
      payment_status: saleForm.paymentStatus,
      sale_status: saleForm.saleStatus,
      sale_date: saleForm.saleDate || undefined,
      notes: saleForm.notes.trim() || undefined,
      reference_number: saleForm.referenceNumber.trim() || undefined,
    };

    if (isAdminUser && saleForm.branchId) {
      payload.branch_id = Number(saleForm.branchId);
    }

    try {
      const endpoint = editingSaleId ? `${API_BASE}/sales/${editingSaleId}` : `${API_BASE}/sales`;
      const method = editingSaleId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaleFormError(data.detail ?? 'Failed to save sale.');
        return;
      }

      closeSaleModal();
      await fetchSales();
    } catch {
      setSaleFormError('Unable to reach the server.');
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
      {/* PayMongo payment modal */}
      {paymentTarget && (
        <PaymentModal
          referenceType="order"
          referenceId={paymentTarget.orderId}
          amount={paymentTarget.amount}
          description={paymentTarget.description}
          customerName={paymentTarget.customerName}
          onClose={() => setPaymentTarget(null)}
          onPaymentSuccess={() => {
            setPaymentTarget(null);
            void fetchOrders();
          }}
        />
      )}

      {/* Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 border-r sticky top-0 left-0 bg-slate-50 border-slate-200 flex-col py-6 font-medium">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-black text-primary tracking-tight">SmartAquaPH Admin</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Water Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'deliveries', icon: Truck, label: 'Orders' },
            { id: 'sales', icon: Receipt, label: 'Sales' },
            { id: 'customers', icon: Users, label: 'Customers' },
            ...(isAdminUser ? [{ id: 'branches', icon: MapIcon, label: 'Branches' }] : []),
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
            { id: 'products', icon: Package, label: 'Products' },
            ...(isAdminUser ? [{ id: 'users', icon: Users, label: 'Users' }] : []),
            { id: 'quality', icon: Droplet, label: 'Maintenance' },
            ...(isAdminUser ? [{ id: 'settings', icon: Settings, label: 'Settings' }] : []),
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
          <div className="pt-6 border-t border-slate-200 space-y-1">
            <button className="w-full text-slate-500 hover:bg-slate-100 rounded-xl px-4 py-2 flex items-center gap-3 transition-colors text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
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
                    ) : paginatedOrders.map((order) => (
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
                            {order.paymentStatus !== 'paid' && order.totalAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentTarget({
                                  orderId: order.id,
                                  amount: order.totalAmount,
                                  description: `Order ${order.orderNumber}`,
                                  customerName: order.customerName,
                                })}
                                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
                              >
                                Pay Online
                              </button>
                            )}
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {filteredOrders.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(orderPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(orderPage * ORDERS_PER_PAGE, filteredOrders.length)} of ${filteredOrders.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderPage((current) => Math.max(1, current - 1))}
                  disabled={orderPage === 1 || filteredOrders.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {orderPage} / {totalOrderPages}
                </span>
                <button
                  type="button"
                  onClick={() => setOrderPage((current) => Math.min(totalOrderPages, current + 1))}
                  disabled={orderPage === totalOrderPages || filteredOrders.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
        ) : activeView === 'sales' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Sales Management</p>
                <h2 className="text-4xl font-bold text-primary">Sales</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllSales}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allSalesSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteSales}
                    disabled={!selectedSaleIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => { void openCreateSaleModal(); }}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                  >
                    Create Sale
                  </button>
                </div>
              </div>
            </header>

            {salesError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {salesError}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4 w-16"><span className="sr-only">Select</span></th>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Sale Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isSalesLoading ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">Loading sales...</td>
                      </tr>
                    ) : sales.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">No sales found.</td>
                      </tr>
                    ) : paginatedSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedSaleIds.includes(sale.id)}
                            onChange={() => toggleSaleSelection(sale.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{sale.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{sale.customerName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{sale.productName}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{sale.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {sale.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{sale.paymentStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{sale.saleStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => { void openEditSaleModal(sale.id); }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${sale.invoiceNumber}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSale(sale.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${sale.invoiceNumber}`}
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {sales.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(salePage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(salePage * ORDERS_PER_PAGE, sales.length)} of ${sales.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setSalePage((current) => Math.max(1, current - 1))}
                  disabled={salePage === 1 || sales.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {salePage} / {totalSalePages}
                </span>
                <button
                  type="button"
                  onClick={() => setSalePage((current) => Math.min(totalSalePages, current + 1))}
                  disabled={salePage === totalSalePages || sales.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {isSaleModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">{editingSaleId ? 'Edit Sale' : 'Create Sale'}</h3>
                    <button onClick={closeSaleModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
                  </div>

                  <form onSubmit={handleSaleSubmit} className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {isAdminUser && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Branch</label>
                          <select
                            value={saleForm.branchId}
                            onChange={e => setSaleForm(f => ({ ...f, branchId: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">Select branch…</option>
                            {saleBranchOptions.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Invoice Number *</label>
                        <input type="text" required value={saleForm.invoiceNumber}
                          onChange={e => setSaleForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sale Date</label>
                        <input type="date" value={saleForm.saleDate}
                          onChange={e => setSaleForm(f => ({ ...f, saleDate: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                        <input type="text" value={saleForm.customerName}
                          onChange={e => setSaleForm(f => ({ ...f, customerName: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Customer Email</label>
                        <input type="email" value={saleForm.customerEmail}
                          onChange={e => setSaleForm(f => ({ ...f, customerEmail: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
                        <input type="text" value={saleForm.productName}
                          onChange={e => setSaleForm(f => ({ ...f, productName: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                        <input type="number" min={1} value={saleForm.quantity}
                          onChange={e => setSaleForm(f => ({ ...f, quantity: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Unit Price</label>
                        <input type="number" min={0} step={0.01} value={saleForm.unitPrice}
                          onChange={e => setSaleForm(f => ({ ...f, unitPrice: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount</label>
                        <input type="number" min={0} step={0.01} value={saleForm.discount}
                          onChange={e => setSaleForm(f => ({ ...f, discount: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tax Rate</label>
                        <input type="number" min={0} step={0.0001} value={saleForm.taxRate}
                          onChange={e => setSaleForm(f => ({ ...f, taxRate: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Shipping Fee</label>
                        <input type="number" min={0} step={0.01} value={saleForm.shippingFee}
                          onChange={e => setSaleForm(f => ({ ...f, shippingFee: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</label>
                        <input type="text" value={saleForm.paymentMethod}
                          onChange={e => setSaleForm(f => ({ ...f, paymentMethod: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Status</label>
                        <select value={saleForm.paymentStatus}
                          onChange={e => setSaleForm(f => ({ ...f, paymentStatus: e.target.value as SaleFormState['paymentStatus'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="refunded">Refunded</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sale Status</label>
                        <select value={saleForm.saleStatus}
                          onChange={e => setSaleForm(f => ({ ...f, saleStatus: e.target.value as SaleFormState['saleStatus'] }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Reference Number</label>
                        <input type="text" value={saleForm.referenceNumber}
                          onChange={e => setSaleForm(f => ({ ...f, referenceNumber: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</label>
                        <textarea rows={2} value={saleForm.notes}
                          onChange={e => setSaleForm(f => ({ ...f, notes: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                      </div>
                    </div>

                    {saleFormError && (
                      <p className="mt-4 text-sm text-red-600 font-medium">{saleFormError}</p>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button type="button" onClick={closeSaleModal}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit"
                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-container transition-all">
                        {editingSaleId ? 'Update Sale' : 'Create Sale'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        ) : activeView === 'products' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Product Catalog</p>
                <h2 className="text-4xl font-bold text-primary">Products</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={toggleSelectAllProducts}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allProductsSelected ? 'Unselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProducts}
                  disabled={!selectedProductIds.length}
                  className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={openAddProduct}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                >
                  Add Product
                </button>
              </div>
            </header>

            {productsError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {productsError}
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
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4">Components</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isProductsLoading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">Loading products...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-500">No products found.</td>
                      </tr>
                    ) : paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{product.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.unitPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {typeof product.components === 'string'
                            ? product.components
                            : Array.isArray(product.components)
                              ? product.components.length === 0
                                ? '—'
                                : product.components
                                  .map((component) =>
                                    component && typeof component === 'object'
                                      ? component.name
                                      : String(component)
                                  )
                                  .join(', ')
                              : JSON.stringify(product.components)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${product.name}`}
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {products.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(productPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(productPage * ORDERS_PER_PAGE, products.length)} of ${products.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setProductPage((current) => Math.max(1, current - 1))}
                  disabled={productPage === 1 || products.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {productPage} / {totalProductPages}
                </span>
                <button
                  type="button"
                  onClick={() => setProductPage((current) => Math.min(totalProductPages, current + 1))}
                  disabled={productPage === totalProductPages || products.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {isProductModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeProductModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingProductId ? 'Edit Product' : 'Add Product'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the product details below.</p>
                  </div>

                  <form onSubmit={handleProductSubmit} className="px-6 py-5 space-y-3 max-h-[80vh] overflow-y-auto pb-20">
                    {productFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {productFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {isAdminUser && (
                        <div className="space-y-1 sm:col-span-2">
                          <label htmlFor="prod-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                          <select
                            id="prod-branch-id"
                            value={productForm.branchId}
                            onChange={(e) => setProductForm((current) => ({ ...current, branchId: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white text-sm"
                          >
                            <option value="">Auto-assign first branch</option>
                            {productBranchOptions.map((branch) => (
                              <option key={branch.id} value={String(branch.id)}>{branch.name || branch.unitId}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label htmlFor="prod-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                        <input
                          id="prod-code"
                          value={productForm.code}
                          onChange={(e) => setProductForm((current) => ({ ...current, code: e.target.value }))}
                          placeholder="PRD-001"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <label htmlFor="prod-unit-price" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Price</label>
                          {productComponents.length > 0 && (
                            <span className="text-xs text-slate-500">
                              Min: ₱{getTotalComponentCost().toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        <input
                          id="prod-unit-price"
                          type="number"
                          min={0}
                          step="0.01"
                          value={productForm.unitPrice}
                          onChange={(e) => setProductForm((current) => ({ ...current, unitPrice: e.target.value }))}
                          className={`w-full px-3 py-2 rounded-lg border outline-none text-sm transition-colors ${
                            productComponents.length > 0 && Number(productForm.unitPrice || 0) < getTotalComponentCost()
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                              : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                          }`}
                          required
                        />
                        {productComponents.length > 0 && Number(productForm.unitPrice || 0) < getTotalComponentCost() && (
                          <p className="text-xs text-red-600 font-medium">Price is below component cost</p>
                        )}
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="prod-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                        <input
                          id="prod-name"
                          value={productForm.name}
                          onChange={(e) => setProductForm((current) => ({ ...current, name: e.target.value }))}
                          placeholder="Mineral Water"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="prod-description" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                        <input
                          id="prod-description"
                          value={productForm.description}
                          onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))}
                          placeholder="Filtered water, 350ml glass bottle"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-3">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Components</label>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 items-stretch">
                            <label className="sr-only" htmlFor="prod-component-select">Inventory component</label>
                            <select
                              id="prod-component-select"
                              value={productComponentToAdd}
                              onChange={(e) => setProductComponentToAdd(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            >
                              <option value="">Select component</option>
                              {inventories
                                .filter((item) => !productComponents.some((component) => component.id === item.id))
                                .map((item) => (
                                  <option key={item.id} value={String(item.id)}>
                                    {item.code} - {item.name}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const selected = inventories.find((item) => String(item.id) === productComponentToAdd);
                                if (!selected) return;
                                setProductComponents((current) => [
                                  ...current,
                                  {
                                    id: selected.id,
                                    code: selected.code,
                                    name: selected.name,
                                    description: selected.description,
                                    unit_cost: selected.unitCost,
                                    quantity: 1,
                                  },
                                ]);
                                setProductComponentToAdd('');
                              }}
                              disabled={!productComponentToAdd}
                              className="px-3 py-2 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              Add
                            </button>
                          </div>
                          {productComponents.length > 0 ? (
                            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2 max-h-48 overflow-y-auto">
                              {productComponents.map((component) => (
                                <div key={component.id} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 border border-slate-100 text-xs">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{component.code} - {component.name}</p>
                                    <p className="text-slate-500 truncate">{component.description || 'No desc'}</p>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <label htmlFor={`qty-${component.id}`} className="font-semibold text-slate-600">Qty:</label>
                                    <input
                                      id={`qty-${component.id}`}
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={component.quantity}
                                      onChange={(e) => setProductComponents((current) => current.map((item) => item.id === component.id ? { ...item, quantity: Math.max(0, Number(e.target.value)) } : item))}
                                      className="w-12 px-1.5 py-1 rounded border border-slate-200 text-center focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setProductComponents((current) => current.filter((item) => item.id !== component.id))}
                                      className="px-2 py-1 rounded border border-red-200 text-red-600 font-semibold hover:bg-red-50 whitespace-nowrap"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">Add components from inventory</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 -mx-6 -mb-5 px-6 py-3 bg-white border-t border-slate-200 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeProductModal}
                        className="px-5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary-container text-sm"
                      >
                        {editingProductId ? 'Update Product' : 'Save Product'}
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
                    ) : paginatedInventories.map((inv) => (
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {inventories.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(inventoryPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(inventoryPage * ORDERS_PER_PAGE, inventories.length)} of ${inventories.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setInventoryPage((current) => Math.max(1, current - 1))}
                  disabled={inventoryPage === 1 || inventories.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {inventoryPage} / {totalInventoryPages}
                </span>
                <button
                  type="button"
                  onClick={() => setInventoryPage((current) => Math.min(totalInventoryPages, current + 1))}
                  disabled={inventoryPage === totalInventoryPages || inventories.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
                <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingInventoryId ? 'Edit Inventory' : 'Add Inventory'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the inventory details below.</p>
                  </div>

                  <form onSubmit={handleInventorySubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
        ) : activeView === 'quality' ? (
          <section>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Maintenance Management</p>
                <h2 className="text-4xl font-bold text-primary">Maintenance</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={toggleSelectAllMaintenance}
                  className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm"
                >
                  {allMaintenanceSelected ? 'Unselect All' : 'Select All'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteMaintenances}
                    disabled={!selectedMaintenanceIds.length}
                    className="px-5 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
                <button
                  type="button"
                  onClick={openAddMaintenanceModal}
                  className="px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </header>

            {maintenanceError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {maintenanceError}
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
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Expiration Days</th>
                      <th className="px-6 py-4">Replaced</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isMaintenanceLoading ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">Loading maintenance items...</td>
                      </tr>
                    ) : maintenance.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-8 text-center text-sm text-slate-500">No maintenance records found.</td>
                      </tr>
                    ) : paginatedMaintenance.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMaintenanceIds.includes(item.id)}
                            onChange={() => toggleMaintenanceSelection(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.branchName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.contact}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-bold">{item.expirationDays}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.dateReplaced ? new Date(item.dateReplaced).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.userName || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditMaintenanceModal(item)}
                              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaintenance(item.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${item.name}`}
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {maintenance.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(maintenancePage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(maintenancePage * ORDERS_PER_PAGE, maintenance.length)} of ${maintenance.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setMaintenancePage((current) => Math.max(1, current - 1))}
                  disabled={maintenancePage === 1 || maintenance.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {maintenancePage} / {totalMaintenancePages}
                </span>
                <button
                  type="button"
                  onClick={() => setMaintenancePage((current) => Math.min(totalMaintenancePages, current + 1))}
                  disabled={maintenancePage === totalMaintenancePages || maintenance.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {isMaintenanceModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={closeMaintenanceModal}
                  className="absolute inset-0 bg-slate-900/45"
                />
                <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingMaintenanceId ? 'Edit Maintenance Item' : 'Add Maintenance Item'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the maintenance item details below.</p>
                  </div>

                  <form onSubmit={handleMaintenanceSubmit} className="px-6 py-5 space-y-4">
                    {maintenanceFormError && (
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                        {maintenanceFormError}
                      </div>
                    )}

                    {isAdminUser && (
                      <div className="space-y-1">
                        <label htmlFor="maint-branch-id" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select
                          id="maint-branch-id"
                          value={maintenanceForm.branchId}
                          onChange={(e) => setMaintenanceForm((c) => ({ ...c, branchId: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                        >
                          <option value="">Auto-assign first branch</option>
                          {maintenanceBranchOptions.map((b) => (
                            <option key={b.id} value={String(b.id)}>{b.name || b.unitId}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor="maint-code" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Code</label>
                      <input
                        id="maint-code"
                        value={maintenanceForm.code}
                        onChange={(e) => setMaintenanceForm((c) => ({ ...c, code: e.target.value }))}
                        placeholder="MAINT-001"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="maint-name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name</label>
                      <input
                        id="maint-name"
                        value={maintenanceForm.name}
                        onChange={(e) => setMaintenanceForm((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Filter Replacement"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="maint-supplier" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Supplier</label>
                        <input
                          id="maint-supplier"
                          value={maintenanceForm.supplier}
                          onChange={(e) => setMaintenanceForm((c) => ({ ...c, supplier: e.target.value }))}
                          placeholder="Supplier name"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="maint-contact" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</label>
                        <input
                          id="maint-contact"
                          value={maintenanceForm.contact}
                          onChange={(e) => setMaintenanceForm((c) => ({ ...c, contact: e.target.value }))}
                          placeholder="Contact info"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="maint-expiration-days" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Expiration Days</label>
                        <input
                          id="maint-expiration-days"
                          type="number"
                          min={0}
                          value={maintenanceForm.expirationDays}
                          onChange={(e) => setMaintenanceForm((c) => ({ ...c, expirationDays: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="maint-date-replaced" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date Replaced</label>
                        <input
                          id="maint-date-replaced"
                          type="date"
                          value={maintenanceForm.dateReplaced}
                          onChange={(e) => setMaintenanceForm((c) => ({ ...c, dateReplaced: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeMaintenanceModal}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container"
                      >
                        {editingMaintenanceId ? 'Update Item' : 'Add Item'}
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
                    ) : paginatedCustomers.map((customer) => (
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {customers.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(customerPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(customerPage * ORDERS_PER_PAGE, customers.length)} of ${customers.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomerPage((current) => Math.max(1, current - 1))}
                  disabled={customerPage === 1 || customers.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {customerPage} / {totalCustomerPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomerPage((current) => Math.min(totalCustomerPages, current + 1))}
                  disabled={customerPage === totalCustomerPages || customers.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
                <div className="relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-100 shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-primary">{editingCustomerId ? 'Edit Customer' : 'Add Customer'}</h3>
                    <p className="text-sm text-slate-500 mt-1">Fill in the customer details below.</p>
                  </div>

                  <form onSubmit={handleAddCustomerSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                      onClick={handleToggleSelectedUsersActive}
                      disabled={!selectedUserIds.length}
                      className="px-5 py-3 rounded-xl border border-outline-variant text-primary font-bold hover:bg-surface-container transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Activate/Deactivate
                    </button>
                  )}
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
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Incentive</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isUsersLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">Loading users...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-slate-500">No users found.</td>
                      </tr>
                    ) : paginatedUsers.map((user) => (
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
                          {user.branchName || '—'}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === 'delivery' ? (
                            <input
                              type="checkbox"
                              checked={user.incentive === true}
                              disabled={!isAdminUser}
                              onChange={() => { void handleIncentiveToggle(user); }}
                              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
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
                                onClick={() => { void handleToggleUserActive(user); }}
                                className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                aria-label={user.isActive ? `Deactivate ${user.email}` : `Activate ${user.email}`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                              </button>
                            )}
                            {isAdminUser && (
                              <button
                                type="button"
                                onClick={() => { void handleDeleteUser(user.id, user.email); }}
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {users.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(userPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(userPage * ORDERS_PER_PAGE, users.length)} of ${users.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setUserPage((current) => Math.max(1, current - 1))}
                  disabled={userPage === 1 || users.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {userPage} / {totalUserPages}
                </span>
                <button
                  type="button"
                  onClick={() => setUserPage((current) => Math.min(totalUserPages, current + 1))}
                  disabled={userPage === totalUserPages || users.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>

                    {isAdminUser && (
                      <div className="space-y-1">
                        <label htmlFor="user-branch" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                        <select
                          id="user-branch"
                          required
                          value={userForm.branchId}
                          onChange={(e) => setUserForm((c) => ({ ...c, branchId: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white"
                        >
                          <option value="">Select branch…</option>
                          {userBranchOptions.map((branch) => (
                            <option key={branch.id} value={String(branch.id)}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

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
                    ) : paginatedBranches.map((branch) => (
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

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <span className="text-xs text-slate-500">
                  {branches.length === 0
                    ? 'Showing 0 of 0'
                    : `Showing ${(branchPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(branchPage * ORDERS_PER_PAGE, branches.length)} of ${branches.length}`}
                </span>
                <button
                  type="button"
                  onClick={() => setBranchPage((current) => Math.max(1, current - 1))}
                  disabled={branchPage === 1 || branches.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600 min-w-16 text-center">
                  {branchPage} / {totalBranchPages}
                </span>
                <button
                  type="button"
                  onClick={() => setBranchPage((current) => Math.min(totalBranchPages, current + 1))}
                  disabled={branchPage === totalBranchPages || branches.length === 0}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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
        ) : activeView === 'settings' && isAdminUser ? (
          <section>
            <header className="mb-10">
              <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Account</p>
              <h2 className="text-4xl font-bold text-primary">Settings</h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Profile & Password */}
              <div className="space-y-6">
                {/* Profile Name */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                  <h3 className="text-lg font-bold text-primary mb-6">Profile</h3>
                  <form onSubmit={handleSaveProfileName} className="space-y-4">
                    <div>
                      <label htmlFor="settings-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        id="settings-name"
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                      />
                    </div>
                    {settingsNameMessage && (
                      <p className={`text-sm font-medium ${settingsNameMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {settingsNameMessage.text}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={settingsNameSaving}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm disabled:opacity-50"
                      >
                        {settingsNameSaving ? 'Saving…' : 'Save Name'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                  <h3 className="text-lg font-bold text-primary mb-6">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label htmlFor="settings-current-pw" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                      <input
                        id="settings-current-pw"
                        type="password"
                        value={settingsCurrentPassword}
                        onChange={(e) => setSettingsCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-new-pw" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                      <input
                        id="settings-new-pw"
                        type="password"
                        value={settingsNewPassword}
                        onChange={(e) => setSettingsNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-confirm-pw" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input
                        id="settings-confirm-pw"
                        type="password"
                        value={settingsConfirmPassword}
                        onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm"
                        required
                      />
                    </div>
                    {settingsPasswordMessage && (
                      <p className={`text-sm font-medium ${settingsPasswordMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {settingsPasswordMessage.text}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={settingsPasswordSaving}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm disabled:opacity-50"
                      >
                        {settingsPasswordSaving ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right: Billing */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                  <h3 className="text-lg font-bold text-primary mb-6">Billing</h3>
                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : subscription ? (() => {
                    const planInfo = SUBSCRIPTION_PLANS.find((p) => p.key === subscription.plan_type) ?? SUBSCRIPTION_PLANS[0];
                    const isExpired = subscription.status === 'expired';
                    const isTrial = subscription.status === 'trial';
                    const isExpiring = subscription.status === 'expiring_soon';
                    const endDate = new Date(subscription.end_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
                    return (
                      <>
                        <div className={`mb-6 p-5 rounded-xl border ${isExpired ? 'bg-red-50 border-red-200' : planInfo.accentBg + ' ' + planInfo.accentBorder}`}>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</p>
                          <div className="flex items-center gap-2">
                            {planInfo.icon === 'zap' && <Zap className={`w-5 h-5 ${isExpired ? 'text-red-500' : planInfo.accent}`} />}
                            {planInfo.icon === 'star' && <Star className={`w-5 h-5 ${isExpired ? 'text-red-500' : planInfo.accent}`} />}
                            <p className={`text-2xl font-black ${isExpired ? 'text-red-600' : planInfo.accent}`}>{planInfo.name}</p>
                            {isTrial && <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Trial</span>}
                            {isExpiring && <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Expiring Soon</span>}
                            {isExpired && <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">Expired</span>}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {isExpired
                              ? `Expired on ${endDate}`
                              : isTrial
                              ? `Trial ends ${endDate} · ${subscription.days_remaining} day${subscription.days_remaining !== 1 ? 's' : ''} left`
                              : `₱${subscribeBillingCycle === 'yearly' ? planInfo.yearlyPrice : planInfo.monthlyPrice} / ${subscribeBillingCycle} · Renews ${endDate}`}
                          </p>
                        </div>
                        <div className="space-y-3 mb-8">
                          {planInfo.features.map((feat: string) => (
                            <div key={feat} className="flex items-center gap-3 text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              {feat}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowUpgradePlan(true)}
                            className="w-full px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                          >
                            {isExpired ? 'Renew Subscription' : 'Change Plan'}
                          </button>
                        </div>
                      </>
                    );
                  })() : (
                    <button
                      onClick={() => { void fetchSubscription(); setShowUpgradePlan(true); }}
                      className="w-full px-5 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all text-sm"
                    >
                      View Plans
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Plan Modal */}
            {showUpgradePlan && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-black text-primary">Choose a Plan</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Billed securely via PayMongo.</p>
                    </div>
                    <button
                      onClick={() => setShowUpgradePlan(false)}
                      className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Billing cycle toggle */}
                  <div className="flex justify-center gap-2 pt-6 px-8">
                    <button
                      onClick={() => setSubscribeBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subscribeBillingCycle === 'monthly' ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >Monthly</button>
                    <button
                      onClick={() => setSubscribeBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${subscribeBillingCycle === 'yearly' ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >Yearly <span className="text-emerald-500 text-xs ml-1">Save ~17%</span></button>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                      const isCurrent = subscription?.plan_type === plan.key && subscription?.status !== 'expired';
                      const price = subscribeBillingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                      return (
                        <div
                          key={plan.key}
                          className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
                            isCurrent ? `${plan.accentBg} ${plan.accentBorder}` : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          {isCurrent && (
                            <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Current
                            </span>
                          )}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              {plan.icon === 'zap' && <Zap className={`w-4 h-4 ${plan.accent}`} />}
                              {plan.icon === 'star' && <Star className={`w-4 h-4 ${plan.accent}`} />}
                              <p className={`text-base font-black ${plan.accent}`}>{plan.name}</p>
                            </div>
                            <p className={`text-3xl font-black ${plan.accent}`}>₱{price}</p>
                            <p className="text-xs text-slate-400 mt-0.5">per {subscribeBillingCycle === 'yearly' ? 'year' : 'month'}</p>
                          </div>
                          <ul className="space-y-2.5 flex-1 mb-6">
                            {plan.features.map((feat: string) => (
                              <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                          <button
                            onClick={() => { if (!isCurrent) void handleSubscribe(plan.key); }}
                            disabled={isCurrent || subscribeLoading}
                            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                              isCurrent
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-container shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50'
                            }`}
                          >
                            {isCurrent ? 'Current Plan' : subscribeLoading ? 'Redirecting…' : `Subscribe · ₱${price}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-slate-400 pb-6">
                    Includes a 30-day free trial. Cancel anytime.
                  </p>
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
