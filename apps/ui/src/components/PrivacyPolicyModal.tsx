import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export default function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-primary">Privacy Policy</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-slate-600 leading-relaxed">
          <p className="text-xs text-slate-400">Last updated: January 1, 2025</p>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">1. Information We Collect</h3>
            <p>We collect information you provide directly to us when you create an account, including your name, email address, business details, and billing information. We also collect usage data such as log files, device information, and activity within the platform to improve our services.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">2. How We Use Your Information</h3>
            <p>We use the information we collect to operate and improve SmartAquaPH, process transactions, send service-related communications, and provide customer support. We do not sell or rent your personal information to third parties.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">3. Data Storage and Security</h3>
            <p>Your data is stored on secure servers and protected using industry-standard encryption. We implement appropriate technical and organizational measures to safeguard your information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">4. Cookies</h3>
            <p>SmartAquaPH uses cookies and similar tracking technologies to maintain session state and analyze platform usage. You may disable cookies through your browser settings, though this may affect certain features of the platform.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">5. Third-Party Services</h3>
            <p>We may use third-party services for analytics, payment processing, and infrastructure. These providers have access to your information only as necessary to perform their functions and are obligated to maintain its confidentiality.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">6. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights or to raise a privacy concern, please contact us at smartaquaph@gmail.com.</p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 mb-1">7. Changes to This Policy</h3>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated effective date.</p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
