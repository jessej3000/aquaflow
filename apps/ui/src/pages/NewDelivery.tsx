import { motion } from 'motion/react';
import { 
  Minus, 
  Plus, 
  Clock, 
  CreditCard, 
  Navigation, 
  Truck, 
  Check, 
  Phone,
  Home,
  Droplet,
  ShoppingCart
} from 'lucide-react';
import { useState } from 'react';
import { Page } from '../types';

interface NewDeliveryProps {
  onNavigate: (page: Page) => void;
}

export default function NewDelivery({ onNavigate }: NewDeliveryProps) {
  const [quantity, setQuantity] = useState(4);
  const [selectedWaterType, setSelectedWaterType] = useState('distilled');
  const [frequency, setFrequency] = useState('one-time');
  const [selectedDay, setSelectedDay] = useState(16);
  const [selectedTime, setSelectedTime] = useState('08:00 AM - 10:00 AM');

  const waterTypes = [
    { id: 'spring', name: 'Spring', tag: 'Purest', info: 'Natural mineral content from protected alpine sources.', price: 12, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkRW-fIm2k7Hv1QIDl6bL3sGhcwzyXfCUwwRfV346EW-VmKf4yH8OiAope4zUloVzq2TKNoSMSnYs65YDzfZTFtpGgzQCHjjZnvafUDCQDHkXWj7xWUlm4wSIAaQejjZpeQVQMdMNxA38x7SILN8LdJ4t9hSEzjFdjO3JsCQPj0lTp-p86M7E1jlo4lOFfep_ESX-aVLFnqfFAzfYNknfFbGYBaqFNa2IwJgf4b54ZVpkV2JSnG5jVOMLS3iDQPL4ep_vCuJyVKyc' },
    { id: 'distilled', name: 'Distilled', info: 'Multi-stage steam distillation for absolute purity.', price: 10, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4ClwrYhlcSmx6-rIdybp2RI5a1qjmKJ8SKpY92zhyF2rsNOQ0qowLUeIfvXlut2gnRWXbRvqKK776-0ihqvd2w514ferTMptBfJYKLDUoir_I_HrAi-th2hkL4hWdD8WFa5hQAuitjfMXmQuGAMBFrXOUZ8gZ26HiRCZ3SOqNMyxQlODDlhfbhTKxZioDU9a3x3z9fT0_HLDOyqkabt1Y2j2nmd9RvdIAHDoXIzpQAg8O1GSs87hAoa22BNDK-DpBtw2z66LlQaU' },
    { id: 'alkaline', name: 'Alkaline', tag: 'pH 9.5+', info: 'Ionized water enhanced with essential electrolytes.', price: 15, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVFPRs3NxF-fxmfaoWyBJ3FzF9NypPAIhVHAy-BhXRzrvez2tSBsqh7LzIXSovzkdHAMrBUUimoql3gi-rx5RrGYFr4Ve7fKRIYSH3fvrGUcBkb5sp3xPxvhUWus_ZwbAivsGYW1IKkjx02QGyFF9LBdSBAW-naOVFbo1_MKMZMKLlYlntvNSSfuQcWqWB73m_f-X1wlQnojxJOBZdor0vILN9e1qehLUngYeH18GVB-iPLf6uoeKg1h043asagg0RLmMVBnlkZyA' },
  ];

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '02:00 PM - 04:00 PM',
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-5xl font-black text-primary tracking-tight mb-4">New Delivery</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl font-medium">
          Select your preferred water source and configure your delivery schedule. High-purity hydration delivered to your doorstep.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration */}
        <div className="lg:col-span-8 space-y-12">
          {/* Water Type */}
          <section>
            <h3 className="text-xl font-black uppercase tracking-widest text-primary mb-6">1. Select Water Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {waterTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedWaterType(type.id)}
                  className={`group relative text-left rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    selectedWaterType === type.id 
                      ? 'border-secondary shadow-xl shadow-secondary/10 bg-white ring-4 ring-secondary/5 scale-[1.02]' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={type.image} 
                      alt={type.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-primary">{type.name}</h4>
                      {type.tag && (
                        <span className="bg-secondary/10 text-secondary text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider">
                          {type.tag}
                        </span>
                      )}
                      {selectedWaterType === type.id && !type.tag && (
                        <div className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4 font-medium leading-relaxed">
                      {type.info}
                    </p>
                    <div className="text-secondary font-black text-sm">
                      ${type.price.toFixed(2)} / 5 gal
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Config row */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-6">Quantity</h4>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 rounded-2xl border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <span className="text-4xl font-black text-primary w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-90"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">5-Gallon<br/>Bottles</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-6">Frequency</h4>
              <div className="grid grid-cols-2 gap-3">
                {['one-time', 'subscription'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFrequency(item)}
                    className={`py-3 rounded-xl font-bold text-sm tracking-tight transition-all duration-300 capitalize ${
                      frequency === item 
                        ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                        : 'border border-outline-variant text-slate-500 hover:border-primary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Scheduler */}
          <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-8">Delivery Scheduler</h4>
            <div className="flex flex-col md:flex-row gap-12">
              <div className="flex-grow">
                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className={`text-[10px] font-black uppercase tracking-widest ${i > 4 ? 'text-slate-300' : 'text-primary/40'}`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[14, 15, 16, 17, 18, 19, 20].map((day, i) => (
                    <button
                      key={day}
                      onClick={() => i <= 4 && setSelectedDay(day)}
                      disabled={i > 4}
                      className={`h-12 w-full flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                        selectedDay === day 
                          ? 'bg-primary text-white shadow-md' 
                          : i > 4 ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:w-64 md:border-l md:pl-12 border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Time Slots</p>
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-xs font-bold ${
                        selectedTime === slot 
                          ? 'border-secondary bg-secondary/5 text-secondary' 
                          : 'border-slate-50 hover:border-secondary/20 text-slate-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedTime === slot ? 'border-secondary' : 'border-slate-300'
                      }`}>
                        {selectedTime === slot && <div className="w-2 h-2 bg-secondary rounded-full" />}
                      </div>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <aside className="lg:col-span-4 space-y-8 sticky top-24">
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl overflow-hidden">
            <div className="bg-primary p-6">
              <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Order Summary
              </h4>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{quantity}x {waterTypes.find(t => t.id === selectedWaterType)?.name} (5 G)</span>
                <span className="font-bold text-primary">${(quantity * (waterTypes.find(t => t.id === selectedWaterType)?.price || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Refillable Deposit</span>
                <span className="font-bold text-primary">$20.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Delivery Fee</span>
                <span className="text-secondary font-black">FREE</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-black text-primary">Total</span>
                <span className="text-2xl font-black text-secondary">${(quantity * (waterTypes.find(t => t.id === selectedWaterType)?.price || 0) + 20).toFixed(2)}</span>
              </div>
              <button 
                className="w-full bg-secondary text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:translate-y-[-2px] hover:shadow-2xl active:translate-y-[1px] transition-all mt-6"
              >
                Place Order
              </button>
              <p className="text-center text-[10px] text-slate-400 font-medium px-6 leading-relaxed">
                By placing your order, you agree to SmartAquaPH's <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Visa •••• 4242</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expires 12/26</p>
              </div>
            </div>
            <button className="text-secondary font-black text-[10px] uppercase tracking-widest hover:underline p-2">Edit</button>
          </div>
        </aside>
      </div>

      {/* Tracking Section */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-secondary font-black text-xs tracking-widest uppercase mb-1 block">In Progress</span>
            <h3 className="text-4xl font-black text-primary tracking-tight">Active Delivery Tracking</h3>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated Arrival</p>
            <p className="text-3xl font-black text-primary">10:45 AM Today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[450px] rounded-[32px] overflow-hidden relative border-4 border-white shadow-2xl">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd0Orm6Anju9bMAfF7NTdXFCpDJR-QZqvcCcTf-CMymYYdg_fM-cq8osVZ8XgPu3Pm0vPoLLmJvaEBY32VYui2-xDrZEcGUOW68f7t-1gaEVlWLPqLCALEAP7P0_tDuDWzi5uW4X6U_6wPUJ65hFHMs9EInDjBhUlXi55Ol6lINZoQRhXVVjhxCQpDNtf4A9MU2XjYKtCXJneDGgVEXabMUFIeYz_lMsLIKa5Bda9h_Pe91yZVRZF2AtZK1-AQz404ySCJYU4RV28" 
              alt="Map Tracking"
            />
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoXmL7tR-6-UHcmG85Vb9zhZ-Copls8r4LTfaKvTlzhYW2Avb6WHqnQ3kmMJu9CcEAvmel5McYS1zNoUkAPlHq2ckuaKcWUBozytRFCNosdVdIW7MWR1oTH9HFQC5nqQyImgw51QRv4PzQo_DAzEMVo4xM76JggPQmANcT9OHkrwS0ulprKE15e4rW9mgEBgZyoaxEZS06G_2AoDfZuT5w2XGtDgzrMSlQNU8tZYINHjoCS3dPeYqk2xsfu52y5kIJRLsn1ooZG9c" 
                  alt="Driver"
                />
              </div>
              <div>
                <p className="text-xs font-black text-primary uppercase">Marcus J. (Driver)</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">Toyota Hiace - Plate #AQ-402</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              {[
                { title: 'Order Confirmed', time: '08:15 AM', desc: 'Payment successful', done: true, line: true },
                { title: 'Dispatched', time: '09:30 AM', desc: 'Loaded and departing depot', done: true, line: true },
                { title: 'In Transit', time: '09:45 AM', desc: 'Current location: Downtown Hub', active: true, line: true },
                { title: 'Delivered', time: '10:45 AM', desc: 'Estimated arrival', future: true },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                      step.done ? 'bg-secondary text-white' :
                      step.active ? 'bg-primary text-white animate-pulse shadow-lg shadow-primary/20' :
                      'bg-slate-100 text-slate-300'
                    }`}>
                      {step.done ? <Check className="w-4 h-4" strokeWidth={4} /> :
                       step.active ? <Truck className="w-4 h-4" /> :
                       <Home className="w-4 h-4" />}
                    </div>
                    {step.line && (
                      <div className={`w-1 h-full absolute top-8 ${
                        step.done ? 'bg-secondary' : 'bg-slate-100'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h5 className={`font-black uppercase text-xs tracking-widest ${
                      step.active ? 'text-primary' : step.future ? 'text-slate-300' : 'text-slate-800'
                    }`}>
                      {step.title}
                    </h5>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      step.active ? 'text-primary' : 'text-slate-400'
                    }`}>
                      {step.time} — {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 p-5 rounded-2xl bg-surface-container text-primary font-black uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center justify-center gap-3 active:scale-95">
              <Phone className="w-4 h-4" />
              Contact Driver
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
