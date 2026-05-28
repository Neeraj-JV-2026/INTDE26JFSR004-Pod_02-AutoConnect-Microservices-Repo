import { Loader2 } from 'lucide-react';

export interface WarrantyModalProps {
  warrantyModal: { dealId: number; vehicleId: number; customerId: number } | null;
  selectedWarrantyType: 'BASIC' | 'EXTENDED' | 'PREMIUM';
  setSelectedWarrantyType: (v: 'BASIC' | 'EXTENDED' | 'PREMIUM') => void;
  warrantyLoading: boolean;
  handleAddWarranty: () => void;
  onSkip: () => void;
}

export function WarrantyModal({
  warrantyModal,
  selectedWarrantyType,
  setSelectedWarrantyType,
  warrantyLoading,
  handleAddWarranty,
  onSkip,
}: WarrantyModalProps) {
  if (!warrantyModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add Warranty Package</h2>
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Deal <strong>#{warrantyModal.dealId}</strong> is finalized. Would you like to add a warranty for Vehicle&nbsp;
          <strong>#{warrantyModal.vehicleId}</strong>?
        </p>

        <div className="space-y-3 mb-6">
          {([
            { type: 'BASIC',    years: 1, miles: '20,000',  label: 'Basic — 1 yr / 20k mi',    detail: 'Powertrain: engine, transmission, drivetrain',            price: '$499' },
            { type: 'EXTENDED', years: 3, miles: '60,000',  label: 'Extended — 3 yr / 60k mi', detail: 'Powertrain + electrical, A/C, suspension',               price: '$1,199' },
            { type: 'PREMIUM',  years: 5, miles: '100,000', label: 'Premium — 5 yr / 100k mi', detail: 'Bumper-to-bumper comprehensive incl. wear items',         price: '$2,499' },
          ] as const).map(opt => (
            <label key={opt.type} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              selectedWarrantyType === opt.type ? 'border-brand-yellow bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="warrantyType"
                value={opt.type}
                checked={selectedWarrantyType === opt.type}
                onChange={() => setSelectedWarrantyType(opt.type)}
                className="mt-0.5 accent-yellow-400"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-sm">{opt.label}</span>
                  <span className="text-sm font-bold text-gray-700">{opt.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{opt.detail}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Skip — no warranty
          </button>
          <button
            onClick={handleAddWarranty}
            disabled={warrantyLoading}
            className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {warrantyLoading ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving...</> : 'Add Warranty'}
          </button>
        </div>
      </div>
    </div>
  );
}
