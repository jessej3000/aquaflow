import { 
  Truck, 
  DollarSign, 
  Clock, 
  Droplets, 
  LogOut, 
  Gauge, 
  GlassWater, 
  Navigation, 
  FlaskConical, 
  Filter, 
  ArrowUpDown, 
  Building2, 
  ClipboardList, 
  Map as MapIcon, 
  History, 
  User, 
  Scan,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const STATS = [
  { label: 'Deliveries', value: '24', change: '+2', icon: Truck, iconBg: 'bg-sky-100', iconColor: 'text-sky-700' },
  { label: 'Per Delivery', value: '$12.50', change: null, icon: DollarSign, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700' },
  { label: 'Avg. Time', value: '18', unit: 'min', icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-700' },
];

interface ApiOrder {
  id: number;
  order_number: string;
  customer_name: string | null;
  quantity: number | null;
  container_size: number | null;
  container_type: string | null;
  total_amount: number | null;
  delivery_address: string | null;
  branch_name: string | null;
  priority_flag: boolean | null;
  order_status: string;
  delivery_id: string | null;
}

interface SessionUser {
  id: string;
  branch_id?: number | null;
  role?: string | null;
  full_name?: string | null;
}

interface DeliveryProps {
  onNavigate: (page: Page) => void;
}

export default function Delivery({ onNavigate }: DeliveryProps) {
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [acceptingOrderId, setAcceptingOrderId] = useState<number | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);

  const getSessionUser = async (token: string): Promise<SessionUser | null> => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as SessionUser;
        if (parsedUser?.id && parsedUser.branch_id !== undefined) {
          return parsedUser;
        }
      } catch {
        // Fall through to /auth/me.
      }
    }

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data?.user) {
      return null;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user as SessionUser;
  };

  const loadOrders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    setIsOrdersLoading(true);
    setOrdersError(null);

    try {
      const sessionUser = await getSessionUser(token);
      if (!sessionUser) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      setCurrentUserId(sessionUser.id);

      if (sessionUser.branch_id == null) {
        setOrdersError('Branch context is missing for this user.');
        setAllOrders([]);
        return;
      }

      const res = await fetch(`${API_BASE}/orders?branch_id=${sessionUser.branch_id}`, {
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
        setOrdersError(data?.detail ?? 'Unable to load available orders.');
        setAllOrders([]);
        return;
      }

      const orders = Array.isArray(data?.orders) ? (data.orders as ApiOrder[]) : [];
      setAllOrders(orders);
    } catch {
      setOrdersError('Unable to load available orders.');
      setAllOrders([]);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      onNavigate('auth');
      return;
    }

    const userId = currentUserId ?? (await getSessionUser(token))?.id ?? null;
    if (!userId) {
      setOrdersError('Unable to determine the current delivery user.');
      return;
    }

    setAcceptingOrderId(orderId);
    setOrdersError(null);

    try {
      // First, mark any existing selected order as delivered
      const existingSelected = allOrders.find(
        (o) => o.order_status === 'out-for-delivery' && o.delivery_id === userId,
      );
      
      if (existingSelected) {
        const completeRes = await fetch(`${API_BASE}/orders/${existingSelected.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_status: 'delivered',
          }),
        });

        if (completeRes.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          onNavigate('auth');
          return;
        }
      }

      // Then, accept the new order
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_status: 'out-for-delivery',
          delivery_id: userId,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        onNavigate('auth');
        return;
      }

      if (!res.ok) {
        setOrdersError(data?.detail ?? 'Unable to accept order.');
        return;
      }

      setActiveOrderId(orderId);
      await loadOrders();
    } catch {
      setOrdersError('Unable to accept order.');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [onNavigate]);

  useEffect(() => {
    const selectedOrders = allOrders.filter(
      (order) => order.order_status === 'out-for-delivery' && order.delivery_id === currentUserId,
    );
    if (selectedOrders.length > 0 && !activeOrderId) {
      setActiveOrderId(selectedOrders[0].id);
    }
  }, [allOrders, currentUserId, activeOrderId]);

  const availableOrders = allOrders.filter((order) => order.order_status === 'pending');
  const selectedOrders = allOrders.filter(
    (order) => order.order_status === 'out-for-delivery' && order.delivery_id === currentUserId,
  );

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatItems = (order: ApiOrder) => {
    const qty = order.quantity ?? 0;
    const size = order.container_size ? `${order.container_size}L` : '';
    const type = order.container_type ? ` ${order.container_type}` : '';
    return `${qty}x ${size}${type}`.trim();
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    onNavigate('auth');
  };

  return (
    <div className="min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-sky-100/50 shadow-sm flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
          <Droplets className="text-primary w-6 h-6" />
          <span className="font-bold text-xl text-primary tracking-tight">AquaFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-full border border-sky-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-primary">Online: Route A-12</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="h-10 w-10 rounded-full bg-sky-100 overflow-hidden border border-sky-200">
            <img 
              alt="Driver profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF03nuxTHb8Sh2R-JEf8nrbx94yKP0UHeqpr6a1aQoROtwJuWA-ZLy2-vKn1VG5X1Fd5JKKE14dnGDno-j--qt7Fo5ZlzGmFmXEUxPvrHDIpcXGfp47r3mhge9s5jBUAcxcW81d2z7ibGw7TvPR5eJDZCDZbENGNjFL3QgZJ84p6bSIfZVqyjX0As7GoQR92mbuM00d_wbsad79gTi-5LbYCrKbUmyG7qVWjwx1d1DT54wCsWAIHV-boN3KmDM-Q4eYltXWyASnM4"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-7xl mx-auto space-y-6">
        {/* Statistics Section */}
        <section className="grid grid-cols-3 gap-3">
          {STATS.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card premium-shadow rounded-xl p-3 flex flex-col md:flex-row items-center gap-2 text-center md:text-left"
            >
              <div className={`p-2 ${stat.iconBg} ${stat.iconColor} rounded-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-slate-500 uppercase truncate">{stat.label}</p>
                <h3 className="text-lg font-bold text-primary flex items-baseline gap-1">
                  {stat.value}
                  {stat.change && <span className="text-[10px] font-normal text-emerald-600">{stat.change}</span>}
                  {stat.unit && <span className="text-[10px] font-normal text-slate-400">{stat.unit}</span>}
                </h3>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selected Orders */}
          <section className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Selected Orders</h2>
              <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="space-y-3">
              {!isOrdersLoading && !ordersError && selectedOrders.length === 0 && (
                <div className="bg-white rounded-xl p-4 border border-sky-100 text-sm text-slate-500">
                  No orders are currently assigned to you.
                </div>
              )}

              {selectedOrders.map((order, idx) => {
                const isActive = order.id === activeOrderId;
                
                if (isActive) {
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                      className="relative group bg-gradient-to-br from-primary-container via-primary/95 to-primary text-white rounded-2xl p-6 shadow-2xl border border-secondary/40 overflow-hidden"
                    >
                      {/* Animated background accent */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
                      </div>

                      {/* Status indicator pulse */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 uppercase">
                          Live
                        </span>
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4 pr-20">
                          <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                            Out for Delivery
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-xl font-bold mb-1 truncate">
                            {order.customer_name || `Order #${order.id}`}
                          </h4>
                          <p className="text-sm opacity-90 flex items-center gap-1">
                            <span className="inline-block">Order #{order.order_number}</span>
                          </p>
                        </div>

                        <div className="mb-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <p className="text-sm opacity-95 truncate font-medium">
                            {order.delivery_address || order.branch_name || 'No address provided'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-[10px] opacity-75 uppercase font-semibold mb-1">Items</p>
                            <p className="text-sm font-bold flex items-center gap-1">
                              <GlassWater className="w-4 h-4" />
                              {formatItems(order)}
                            </p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-[10px] opacity-75 uppercase font-semibold mb-1">Total</p>
                            <p className="text-sm font-bold">{formatCurrency(order.total_amount)}</p>
                          </div>
                        </div>

                        <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 rounded-lg transition-all active:scale-95 backdrop-blur-sm border border-white/20">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-white hover:bg-sky-50 transition-colors rounded-xl p-3 flex items-center gap-3 border border-sky-100 premium-shadow cursor-pointer"
                      onClick={() => setActiveOrderId(order.id)}
                    >
                      <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {order.customer_name || order.order_number || `Order #${order.id}`}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {formatItems(order)} • {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </div>
          </section>

          {/* Available Orders */}
          <section className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Available Orders</h2>
              <div className="flex gap-2">
                <button className="bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-sky-100 text-sky-800 flex items-center gap-1 shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-sky-100 text-sky-800 flex items-center gap-1 shadow-sm">
                  <ArrowUpDown className="w-4 h-4" /> Priority
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {isOrdersLoading && (
                <div className="bg-white rounded-xl p-4 border border-sky-100 text-sm text-slate-500">
                  Loading available orders...
                </div>
              )}

              {!isOrdersLoading && ordersError && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-sm text-red-600">
                  {ordersError}
                </div>
              )}

              {!isOrdersLoading && !ordersError && availableOrders.length === 0 && (
                <div className="bg-white rounded-xl p-4 border border-sky-100 text-sm text-slate-500">
                  No pending orders available.
                </div>
              )}

              {!isOrdersLoading && !ordersError && availableOrders.map((order, idx) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="group bg-white hover:bg-sky-50 transition-colors rounded-xl p-3 flex items-center gap-3 border border-sky-100 premium-shadow"
                >
                  <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {order.customer_name || order.order_number || `Order #${order.id}`}
                      </h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0 rounded flex-shrink-0 ${
                        order.priority_flag ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'
                      }`}>
                        {order.priority_flag ? 'High' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {formatItems(order)}</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span>
                      <span className="truncate">{order.delivery_address || order.branch_name || 'No address'}</span>
                    </div>
                  </div>
                  <button className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                    order.priority_flag ? 'bg-primary text-white border-transparent' : 'border border-primary text-primary'
                  }`}
                    onClick={() => void handleAcceptOrder(order.id)}
                    disabled={acceptingOrderId === order.id}
                  >
                    {acceptingOrderId === order.id ? 'Accepting...' : 'Accept'}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Alert Banner */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="mt-6 bg-secondary-container rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg gap-4"
            >
              <div className="flex gap-4">
                <div className="p-3 bg-white/30 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-primary font-bold text-base">Low Stock: Purified 20L</h4>
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Inventory</span>
                  </div>
                  <p className="text-primary/70 text-sm">Refill suggested at Main Hub before 4:00 PM</p>
                </div>
              </div>
              <button className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-primary/90 transition-colors">
                Route to Hub
              </button>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-6 bottom-24 bg-primary text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <Scan className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white flex justify-around items-center px-4 py-3 border-t border-slate-100 shadow-[0_-4px_20px_0_rgba(7,89,133,0.08)] z-50">
        <NavButton icon={ClipboardList} label="Tasks" active />
        <NavButton icon={MapIcon} label="Map" />
        <NavButton icon={History} label="History" />
        <NavButton icon={User} label="Profile" />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 transition-all ${
      active ? 'text-primary' : 'text-slate-400 hover:text-primary'
    }`}>
      <div className={`p-1 rounded-xl transition-all ${active ? 'bg-sky-50' : 'bg-transparent'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
