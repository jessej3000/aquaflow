import { motion } from 'motion/react';
import { PlayCircle, ShieldCheck, Package, Droplets, Activity, CheckCircle2 } from 'lucide-react';
import { Page } from '../types';
import waterstation from '../assets/waterstation.png';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-surface-container-low to-sky-50"></div>
          <img 
            alt="Clean Water Essence" 
            className="w-full h-full object-cover opacity-20 mix-blend-multiply" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWYBs8QnbhJ-1yEihaKJqVT6MoQqMH3Wk0oc069amvV1ko9NBKZqG0GNwpEAuXZeOaWShLO84bS81j7n99V4oReBOqQak0zQ_y6dIt2P5I-bvfDvJH18VjXUen5xedxoGYI4cdt0cDhOxLZJriOSLpnMfxHk8YcMkNP25BltXuQOaLm7G3Th5v-k-7MC2_aDazHON2FS5BJuOTvqSm50wwE4RVc7-LlBCatR-dw2Uz9DFR29cAiI3rrnZD7zLQzmXrzv4RhNYt4dY"
          />
        </div>
        <div className="container mx-auto px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Temporarily hidden
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-secondary text-sm font-medium border border-secondary/10">
              <ShieldCheck className="w-4 h-4" />
              <span>Trusted by 500+ Water Delivery Plants</span>
            </div>
            */}
            <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
              Purify Your Operations with <span className="text-secondary">Smart Flow</span> Systems.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl">
              SmartAquaPH streamlines water delivery logistics, monitors quality levels in real-time, and scales your refill business with automated customer management.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="border-2 border-secondary text-secondary px-8 py-4 rounded-xl font-bold hover:bg-secondary/5 transition-all flex items-center gap-2 active:scale-95">
                Sign Up
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-4 bg-sky-200/30 blur-3xl rounded-full"></div>
            <div className="relative glass-card p-4 rounded-2xl shadow-xl">
              <img 
                alt="Dashboard Preview" 
                className="rounded-xl w-full border border-slate-100" 
                src={waterstation}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features bento grid */}
      <section className="py-24 bg-white" id="solutions">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-primary mb-4">Precision at Every Drop</h2>
            <p className="text-on-surface-variant">Our integrated suite provides tools designed specifically for the unique challenges of the water refilling industry.</p>
          </div>
          <div className="grid md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 bg-surface-container-low rounded-3xl p-8 relative overflow-hidden border border-slate-100 group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Smart Order Management</h3>
                <p className="text-on-surface-variant max-w-sm">Automate recurring orders, manage subscriptions, and optimize delivery routes instantly.</p>
              </div>
              <img 
                alt="Logistics" 
                className="absolute right-0 bottom-0 w-1/2 opacity-20 group-hover:scale-110 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq4NUW4JUUc4Y5zUj2qaUkWSO2eTSkHnouNtZGXP3GfRPfiSyBAYhA8dxRIRCrz922DZzoAsasaMc0gR8YKJJjUW1-QHMXjsfhg0K5sEF3TwoE7TxihpC8PBOdoXkk4apWqFnocXWUr9IUcwoEqCLZgdVDhFx9jQk4I2c9NfKKv52yjG5UHsQscrz6CyDNekB8Hs9b90rfd9U6g23wyT6lKzduITBtMzcUxCZij587h0Ix6ZgFlvLD3oLhUnGZBP66nIHd4FZkW-g"
              />
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-1 md:row-span-2 bg-secondary/5 rounded-3xl p-8 flex flex-col justify-between border border-secondary/10"
            >
              <div>
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Smart Delivery Management</h3>
                <p className="text-on-surface-variant">Automated delivery scheduling and route optimization ensure fast, efficient, and on-time water distribution to customers. Real-time order tracking allows operators to monitor drivers, manage deliveries, and improve customer satisfaction.</p>
              </div>
              <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-secondary/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Current TDS</span>
                  <span className="text-xl font-black text-primary">024 PPM</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '24%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-secondary-container h-full"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Optimal Range: 0-50 PPM</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 bg-primary text-white rounded-3xl p-8 relative overflow-hidden border border-primary-container"
            >
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-secondary-container" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
                <p className="opacity-80 max-w-md">Comprehensive dashboards tracking revenue, delivery efficiency, and customer retention trends.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-secondary/20 blur-3xl rounded-full"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-surface" id="pricing">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary">Simple, Scalable Pricing</h2>
            {/* <p className="text-on-surface-variant mt-2">Choose the plan that matches your production capacity.</p> */}
          </div>
          <div className="flex justify-center">
            {/* Essential */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full max-w-sm w-full">
              <div className="mb-8">
                <h4 className="text-xl font-bold text-primary">Entry</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-primary">₱299</span>
                  <span className="text-on-surface-variant ml-2">/month</span>
                </div>
                <p className="text-on-surface-variant mt-4 text-sm">Perfect for local single-unit refilling stations.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  '1 water refilling station',
                  'Customer CRM',
                  'Delivery Management',
                  'Order & Sales management'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-on-surface text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate('auth')}
                className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <div className="bg-surface-container-highest rounded-[40px] p-12 lg:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
              <img 
                alt="Water condensation" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtftaFxCzfg1UQWXm_5fNRfNFCf22QctLVPktF0VRYiPjy_Poq6sSgb7P8O99GEbvfbce-3q9O0H4GACXO2gPeqgbiCb07UFmWKxwGi547Bydfevgu3bT7CNnqxKOSU-2s9N53fcHwTWtTiK9glgKSoF7P2-Fi14CclJVGLy8MJ3RxM9h33xV5z3Io17-ByjMcLJqyxA3NI-7-OgkLWHBIJZV66TLo9lsQ37ce61E_hXdN-ndOjREG67bowmK1l5xDkZVPyiOPbDk"
              />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready to streamline your water distribution?</h2>
              <p className="text-xl text-on-surface-variant mb-10 leading-relaxed font-medium">Join hundreds of water businesses that have improved efficiency by over 40% with SmartAquaPH.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('auth')}
                  className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Get Started for Free
                </button>
                <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold border border-primary-container hover:bg-slate-50 transition-all active:scale-95">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
