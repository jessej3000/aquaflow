import React, { useEffect, useRef, useState } from 'react';
import {
  ShoppingCart,
  User,
  Clock,
  LogOut,
  Droplet,
  Leaf,
  Waves,
  Package,
  ShoppingBasket,
  Delete,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface PosPageProps {
  onNavigate: (page: Page) => void;
}

interface ProductComponent {
  id: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  category: string;
  components: ProductComponent[];
}

interface OrderItem extends Product {
  quantity: number;
}

interface SaleApiRow {
  id: number | string;
  product_name?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  sale_date?: string | null;
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Purified 5G', price: 2.50, icon: <Droplet className="w-8 h-8" />, category: 'Water', components: [] },
  { id: 'p2', name: 'Alkaline 5G', price: 3.50, icon: <Leaf className="w-8 h-8" />, category: 'Water', components: [] },
  { id: 'p3', name: 'Distilled 5G', price: 2.00, icon: <Waves className="w-8 h-8" />, category: 'Water', components: [] },
  { id: 'p4', name: 'New Container', price: 12.00, icon: <Package className="w-8 h-8" />, category: 'Accessories', components: [] },
  { id: 'p5', name: 'Bottle Cap', price: 0.25, icon: <ShoppingBasket className="w-8 h-8" />, category: 'Accessories', components: [] },
];

const ASSISTANT_DELETE_CODE = '1234';

const getProductIcon = (name: string): React.ReactNode => {
  const normalized = name.toLowerCase();
  if (normalized.includes('alkaline') || normalized.includes('water')) {
    return <Droplet className="w-8 h-8" />;
  }
  if (normalized.includes('distilled') || normalized.includes('spring')) {
    return <Waves className="w-8 h-8" />;
  }
  if (normalized.includes('container') || normalized.includes('package')) {
    return <Package className="w-8 h-8" />;
  }
  if (normalized.includes('cap') || normalized.includes('accessory')) {
    return <ShoppingBasket className="w-8 h-8" />;
  }
  return <Package className="w-8 h-8" />;
};

export default function PosPage({ onNavigate }: PosPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? '{}') as {
        full_name?: string;
        email?: string;
        branch_name?: string;
        branch_id?: number | string;
        role?: string;
      };
    } catch {
      return {};
    }
  })();
  const operatorName = loggedInUser.full_name || loggedInUser.email || 'Operator';

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [selectedProductName, setSelectedProductName] = useState(PRODUCTS[0].name);
  const [keypadValue, setKeypadValue] = useState('02');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [pendingDeleteItemName, setPendingDeleteItemName] = useState('');
  const [assistantCodeInput, setAssistantCodeInput] = useState('');
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [saveSaleError, setSaveSaleError] = useState<string | null>(null);
  const [saveSaleSuccess, setSaveSaleSuccess] = useState<string | null>(null);
  const transactionListRef = useRef<HTMLDivElement | null>(null);


  const mapSaleToOrderItem = (sale: SaleApiRow): OrderItem => {
    const matchedProduct = PRODUCTS.find((product) => product.name === sale.product_name);

    return {
      ...(matchedProduct ?? {
        id: `sale-${sale.id}`,
        name: sale.product_name ?? 'Unnamed Item',
        price: Number(sale.unit_price ?? 0),
        icon: <Package className="w-8 h-8" />,
        category: 'Sales',
        components: [],
      }),
      id: `sale-${sale.id}`,
      name: sale.product_name ?? matchedProduct?.name ?? 'Unnamed Item',
      price: Number(sale.unit_price ?? matchedProduct?.price ?? 0),
      quantity: Number(sale.quantity ?? 0),
    };
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const list = transactionListRef.current;
    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [orderItems]);

  useEffect(() => {
    const loadProducts = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      setIsProductsLoading(true);
      setProductsError(null);

      try {
        // branch_id is required for product filtering
        if (!loggedInUser.branch_id) {
          setProductsError('Branch information not found. Please log in again.');
          setIsProductsLoading(false);
          return;
        }

        const productsUrl = new URL(`${API_BASE}/products`);
        productsUrl.searchParams.set('branch_id', String(loggedInUser.branch_id));

        const res = await fetch(productsUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          onNavigate('auth');
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail ?? `Unable to load products (${res.status}).`);
        }

        const data = await res.json();
        const fetchedProducts = Array.isArray(data.products) ? data.products : [];
        const mappedProducts = fetchedProducts.map((product: any) => {
          const raw = product.components;
          const components: ProductComponent[] = Array.isArray(raw)
            ? raw.map((c: any) => ({ id: Number(c.id), quantity: Number(c.quantity) }))
            : typeof raw === 'string'
            ? (() => { try { return JSON.parse(raw).map((c: any) => ({ id: Number(c.id), quantity: Number(c.quantity) })); } catch { return []; } })()
            : [];
          return {
            id: String(product.id),
            name: product.name,
            price: Number(product.unit_price ?? 0),
            icon: getProductIcon(product.name ?? ''),
            category: 'Products',
            components,
          };
        });

        setProducts(mappedProducts);
        if (mappedProducts.length > 0) {
          setSelectedProductId(mappedProducts[0].id);
          setSelectedProductName(mappedProducts[0].name);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load products.';
        setProductsError(message);
      } finally {
        setIsProductsLoading(false);
      }
    };

    void loadProducts();
  }, [onNavigate, loggedInUser.branch_id]);

  useEffect(() => {
    const loadTodaysSales = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      try {
        const salesUrl = new URL(`${API_BASE}/sales`);
        if (loggedInUser.branch_id) {
          salesUrl.searchParams.set('branch_id', String(loggedInUser.branch_id));
        }

        const res = await fetch(salesUrl.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          onNavigate('auth');
          return;
        }

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const todaysSales = Array.isArray(data.sales)
          ? data.sales.filter((sale: SaleApiRow) => {
              if (!sale.sale_date) {
                return false;
              }

              const saleDate = new Date(sale.sale_date);
              if (Number.isNaN(saleDate.getTime())) {
                return false;
              }

              const saleKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}-${String(saleDate.getDate()).padStart(2, '0')}`;
              return saleKey === todayKey;
            })
          : [];

        const sortedTodaysSales = [...todaysSales].sort((left: SaleApiRow, right: SaleApiRow) => {
          const leftTime = left.sale_date ? new Date(left.sale_date).getTime() : 0;
          const rightTime = right.sale_date ? new Date(right.sale_date).getTime() : 0;
          return leftTime - rightTime;
        });

        setOrderItems(sortedTodaysSales.map(mapSaleToOrderItem));
      } catch {
        // Keep the transaction list empty when today's sales cannot be loaded.
      }
    };

    void loadTodaysSales();
  }, [onNavigate]);

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
  };

  const deductInventoryComponents = async (product: Product, soldQty: number) => {
    const token = localStorage.getItem('access_token');
    if (!token || !product.components.length) return;
    await Promise.all(
      product.components.map((component) =>
        fetch(`${API_BASE}/inventories/${component.id}/deduct`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: component.quantity * soldQty }),
        })
      )
    );
  };

  const applySelectedProductToOrder = async () => {
    const selectedProduct = products.find((product) => product.id === selectedProductId);
    if (!selectedProduct) return;

    const parsedQty = Math.floor(Number(keypadValue));
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) return;

    if (selectedProduct.components.length > 0) {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      for (const component of selectedProduct.components) {
        const res = await fetch(`${API_BASE}/inventories/${component.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue; // can't verify (wrong branch/deleted) — let deduct validate
        const data = await res.json();
        const available = Number(data.inventory?.quantity ?? 0);
        const needed = component.quantity * parsedQty;
        if (available < needed) {
          alert(`Not enough inventory: ${data.inventory?.name ?? `Item #${component.id}`} (need ${needed}, have ${available})`);
          return;
        }
      }
    }

    const newItem = {
      ...selectedProduct,
      id: `${selectedProduct.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      quantity: parsedQty,
    };

    setOrderItems([...orderItems, newItem]);
    setKeypadValue('0');
    void handleSaveSale(newItem);
    void deductInventoryComponents(selectedProduct, parsedQty);
  };

  const updateQuantity = (id: string, delta: number) => {
    setOrderItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearKeypad = () => setKeypadValue('0');
  const handleKeypadPress = (val: string) => {
    setKeypadValue(prev => {
      if (prev === '0' && val !== '.') return val;
      if (prev.includes('.') && val === '.') return prev;
      if (prev.length >= 8) return prev;
      return prev + val;
    });
  };

  const openDeleteModal = (itemId: string, itemName: string) => {
    setPendingDeleteItemId(itemId);
    setPendingDeleteItemName(itemName);
    setAssistantCodeInput('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPendingDeleteItemId(null);
    setPendingDeleteItemName('');
    setAssistantCodeInput('');
  };

  const confirmDeleteWithCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (assistantCodeInput === ASSISTANT_DELETE_CODE && pendingDeleteItemId) {
      setOrderItems((prev) => prev.filter((item) => item.id !== pendingDeleteItemId));
    }

    // Wrong code should just close the modal and keep the item unchanged.
    closeDeleteModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    onNavigate('auth');
  };

  const handleSaveSale = async (itemToSave: OrderItem) => {

    const token = localStorage.getItem('access_token');
    if (!token) {
      setSaveSaleError('You are not logged in.');
      setSaveSaleSuccess(null);
      onNavigate('auth');
      return;
    }

    setIsSavingSale(true);
    setSaveSaleError(null);
    setSaveSaleSuccess(null);

    try {
      let branchId: number | undefined;

      // Use branch_id stored at login — no extra API call needed.
      if ((loggedInUser as any).branch_id) {
        branchId = Number((loggedInUser as any).branch_id);
      } else if ((loggedInUser as any).role?.toLowerCase() !== 'admin') {
        // Fallback: fetch branches if branch_id wasn't stored (older session).
        const branchRes = await fetch(`${API_BASE}/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!branchRes.ok) {
          setSaveSaleError('Unable to determine branch context.');
          return;
        }

        const branchData = await branchRes.json();
        const firstBranch = Array.isArray(branchData.branches) ? branchData.branches[0] : null;
        if (!firstBranch) {
          setSaveSaleError('No branch found for current user.');
          return;
        }

        branchId = Number(firstBranch.id);
      }

      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      const subtotal = itemToSave.price * itemToSave.quantity;
      const invoiceNumber = `POS-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          customer_name: 'Walk-in Customer',
          product_name: itemToSave.name,
          quantity: itemToSave.quantity,
          unit_price: itemToSave.price,
          discount: 0,
          subtotal,
          tax_rate: 0,
          tax_amount: 0,
          shipping_fee: 0,
          total_amount: subtotal,
          currency: 'PHP',
          payment_method: 'cash',
          payment_status: 'paid',
          sale_status: 'completed',
          sale_date: now.toISOString(),
          notes: 'Saved from POS page',
          ...(branchId ? { branch_id: branchId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? 'Failed to save sale entry.');
      }

      setSaveSaleSuccess('Sale saved successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save sale.';
      setSaveSaleError(message);
    } finally {
      setIsSavingSale(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-surface flex flex-col font-sans selection:bg-secondary/20">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-surface-container-high px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter text-primary">SmartAquaPH</h1>
          <div className="h-6 w-px bg-surface-container-high"></div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            <span className="text-sm font-medium text-on-surface-variant">Operator: {operatorName}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full border border-surface-container-high/50">
            <Clock className="w-4 h-4 text-secondary/70" />
            <span className="text-sm font-bold tracking-wider text-primary">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase()}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleLogout}
              className="p-2 text-on-surface-variant/60 hover:bg-surface-container hover:text-primary rounded-full transition-all active:scale-90"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden p-8 grid grid-cols-12 gap-8">
        {/* Left Column: Transaction List */}
        <section className="col-span-12 lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden">
          <div className="flex-1 glass-card rounded-2xl flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-container-high/50 bg-white/50">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Current Transaction
              </h2>
            </div>

            <div
              ref={transactionListRef}
              className="flex-1 min-h-0 overflow-y-scroll pr-3 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-slate-100"
            >
              <table className="w-full table-fixed">
                <colgroup>
                  <col />
                  <col className="w-[72px]" />
                  <col className="w-[96px]" />
                  <col className="w-[72px]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-white border-b border-surface-container-high/30">
                  <tr className="text-on-surface-variant/50 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="text-left font-black px-6 py-4">Item</th>
                    <th className="text-center font-black">Qty</th>
                    <th className="text-right font-black">Total</th>
                    <th className="text-right font-black">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/20">
                  <AnimatePresence initial={false}>
                    {orderItems.map((item) => (
                      <motion.tr 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group"
                      >
                        <td className="py-5 px-6">
                          <p className="font-bold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface-variant/40">Unit: ${item.price.toFixed(2)}</p>
                        </td>
                        <td className="py-5 text-center">
                          <span className="font-bold text-primary min-w-[2ch]">{item.quantity.toString().padStart(2, '0')}</span>
                        </td>
                        <td className="py-5 text-right font-black text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-5 text-right pr-6">
                          <button
                            onClick={() => openDeleteModal(item.id, item.name)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-error hover:bg-error/10 transition-all active:scale-95"
                            aria-label={`Delete ${item.name}`}
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-6 border-t-2 border-dashed border-surface-container-high bg-surface-container-low/30 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-medium text-on-surface-variant/60">
                  Grand Total
                </span>
                <span className="text-4xl font-black text-primary tracking-tighter">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              {saveSaleError && (
                <p className="text-xs font-bold text-error">{saveSaleError}</p>
              )}
              {saveSaleSuccess && (
                <p className="text-xs font-bold text-emerald-600">{saveSaleSuccess}</p>
              )}
              {isSavingSale && (
                <p className="text-xs font-bold text-secondary/70">Saving...</p>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Interaction Section */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-8 h-full overflow-hidden">
          {/* Product Grid */}
          <div className="grid grid-cols-3 gap-2">
            {isProductsLoading ? (
              <div className="col-span-3 rounded-2xl border border-dashed border-secondary/30 bg-surface-container-low/50 p-6 text-center text-sm text-secondary">
                Loading products...
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <button 
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  className={`glass-card p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all active:scale-95 group ${
                    selectedProductId === product.id ? 'border-secondary' : 'border-transparent hover:border-secondary'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container group-hover:scale-105 transition-transform [&_svg]:w-4 [&_svg]:h-4">
                    {product.icon}
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-bold text-primary leading-tight">{product.name}</p>
                    <span className="inline-block text-[9px] font-black px-1.5 py-0.5 bg-secondary/10 text-on-secondary-container rounded-full border border-secondary/5">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-3 rounded-2xl border border-dashed border-secondary/30 bg-surface-container-low/50 p-6 text-center text-sm text-secondary">
                {productsError ?? 'No products available for this branch.'}
              </div>
            )}
          </div>

          {/* Keypad Section */}
          <div className="flex-1 glass-card rounded-2xl p-8 flex flex-col min-h-0">
            <div className="mb-6 flex items-end justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">Input Value</span>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-black text-primary">{selectedProductName}</p>
                  <p className="text-3xl font-black text-primary">Qty: {keypadValue.padStart(2, '0')}</p>
                </div>
              </div>
              <button 
                onClick={clearKeypad}
                className="flex items-center gap-2 text-error font-bold text-sm hover:underline"
              >
                <Delete className="w-5 h-5" />
                Clear
              </button>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="bg-white border border-surface-container-high/50 rounded-2xl text-2xl font-black text-primary hover:bg-surface-container active:scale-95 transition-all shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={applySelectedProductToOrder}
                className="bg-secondary text-white rounded-2xl hover:bg-secondary/90 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-secondary/20"
              >
                <CheckCircle className="w-10 h-10" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Decorative Background */}
      <div className="fixed bottom-0 right-0 -z-10 opacity-[0.03] pointer-events-none select-none">
        <Droplet className="w-[800px] h-[800px] text-primary" strokeWidth={0.5} />
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-surface-container-high bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-primary">Delete Item</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Enter assistant code to delete {pendingDeleteItemName}.
            </p>

            <form className="mt-5 space-y-4" onSubmit={confirmDeleteWithCode}>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-on-surface-variant" htmlFor="assistantCode">
                  Assistant Code
                </label>
                <input
                  id="assistantCode"
                  type="password"
                  value={assistantCodeInput}
                  onChange={(event) => setAssistantCodeInput(event.target.value)}
                  className="w-full rounded-xl border border-surface-container-high px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-secondary"
                  placeholder="Enter code"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="rounded-xl border border-surface-container-high px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-error px-4 py-2 text-sm font-bold text-white hover:bg-error/90"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
