import { X, Mail } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

export default function ContactModal({ onClose }: ContactModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-primary">Contact Us</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Email us at</p>
            <a
              href="mailto:smartaquaph@gmail.com"
              className="text-sm font-semibold text-primary hover:underline"
            >
              smartaquaph@gmail.com
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
