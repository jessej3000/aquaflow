import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  Clock, 
  Bell, 
  Settings, 
  LogOut, 
  Droplet, 
  Leaf, 
  Waves, 
  Package, 
  ShoppingBasket, 
  PlusCircle, 
  Delete,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';

interface PosPageProps {
  onNavigate: (page: Page) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  category: string;
}

interface OrderItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Purified 5G', price: 2.50, icon: <Droplet className="w-8 h-8" />, category: 'Water' },
  { id: 'p2', name: 'Alkaline 5G', price: 3.50, icon: <Leaf className="w-8 h-8" />, category: 'Water' },
  { id: 'p3', name: 'Distilled 5G', price: 2.00, icon: <Waves className="w-8 h-8" />, category: 'Water' },
  { id: 'p4', name: 'New Container', price: 12.00, icon: <Package className="w-8 h-8" />, category: 'Accessories' },
  { id: 'p5', name: 'Bottle Cap', price: 0.25, icon: <ShoppingBasket className="w-8 h-8" />, category: 'Accessories' },
];

const ASSISTANT_DELETE_CODE = '1234';

export default function PosPage({ onNavigate }: PosPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { ...PRODUCTS[0], quantity: 2 },
    { ...PRODUCTS[3], quantity: 1 }
  ]);
  const [keypadValue, setKeypadValue] = useState('02');
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [selectedProductName, setSelectedProductName] = useState(PRODUCTS[0].name);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [pendingDeleteItemName, setPendingDeleteItemName] = useState('');
  const [assistantCodeInput, setAssistantCodeInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
  };

  const applySelectedProductToOrder = () => {
    const selectedProduct = PRODUCTS.find((product) => product.id === selectedProductId);
    if (!selectedProduct) {
      return;
    }

    const parsedQty = Math.floor(Number(keypadValue));
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      return;
    }

    setOrderItems(prev => {
      const existing = prev.find(item => item.id === selectedProduct.id);
      if (existing) {
        return prev.map(item =>
          item.id === selectedProduct.id ? { ...item, quantity: item.quantity + parsedQty } : item
        );
      }
      return [...prev, { ...selectedProduct, quantity: parsedQty }];
    });

    setKeypadValue('0');
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

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-secondary/20">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-surface-container-high z-50 px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter text-primary">AquaFlow</h1>
          <div className="h-6 w-px bg-surface-container-high"></div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            <span className="text-sm font-medium text-on-surface-variant">Operator: John Doe</span>
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
            <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container hover:text-primary rounded-full transition-all active:scale-90">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-on-surface-variant/60 hover:bg-surface-container hover:text-primary rounded-full transition-all active:scale-90">
              <Settings className="w-5 h-5" />
            </button>
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

      {/* Spacing for fixed header */}
      <div className="h-16" />

      <main className="flex-1 p-8 grid grid-cols-12 gap-8 h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Column: Transaction List */}
        <section className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <div className="flex-1 glass-card rounded-2xl flex flex-col min-h-0">
            <div className="px-6 py-5 border-b border-surface-container-high/50 bg-white/50">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Current Transaction
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <table className="w-full">
                <thead>
                  <tr className="text-on-surface-variant/50 text-[10px] font-black uppercase tracking-[0.2em] border-b border-surface-container-high/30">
                    <th className="py-4 text-left">Item</th>
                    <th className="py-4 text-center">Qty</th>
                    <th className="py-4 text-right">Total</th>
                    <th className="py-4 text-right">Action</th>
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
                        <td className="py-5">
                          <p className="font-bold text-on-surface">{item.name}</p>
                          <p className="text-xs text-on-surface-variant/40">Unit: ${item.price.toFixed(2)}</p>
                        </td>
                        <td className="py-5 text-center">
                          <span className="font-bold text-primary min-w-[2ch]">{item.quantity.toString().padStart(2, '0')}</span>
                        </td>
                        <td className="py-5 text-right font-black text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-5 text-right">
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

            <div className="px-6 py-8 border-t-2 border-dashed border-surface-container-high bg-surface-container-low/30">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-medium text-on-surface-variant/60">Grand Total</span>
                <span className="text-4xl font-black text-primary tracking-tighter">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Interaction Section */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-8 h-full overflow-hidden">
          {/* Product Grid */}
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTS.map((product) => (
              <button 
                key={product.id}
                onClick={() => selectProduct(product)}
                className={`glass-card p-6 rounded-2xl flex flex-col items-center gap-4 border-2 transition-all active:scale-95 group ${
                  selectedProductId === product.id ? 'border-secondary' : 'border-transparent hover:border-secondary'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container group-hover:scale-105 transition-transform">
                  {product.icon}
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-bold text-primary">{product.name}</p>
                  <span className="inline-block text-[10px] font-black px-2.5 py-0.5 bg-secondary/10 text-on-secondary-container rounded-full border border-secondary/5">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
            <button className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-secondary-container/50 text-secondary transition-all active:scale-95 hover:bg-secondary/5 group">
              <PlusCircle className="w-8 h-8 group-hover:rotate-90 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Custom Item</p>
            </button>
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
