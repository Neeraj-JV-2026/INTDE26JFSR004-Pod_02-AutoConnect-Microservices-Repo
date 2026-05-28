import { Loader2 } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';
import { StatusBadge, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── ValuationTab ──────────────────────────────────────────────────────────────

export interface ValuationTabProps {
  vinInput: string;
  setVinInput: (v: string) => void;
  valuationResult: any;
  valuationLoading: boolean;
  valuationError: string;
  handleVinAppraise: () => void;
  customers: any[];
  allVehicles: any[];
  tradeInCustomerId: number;
  setTradeInCustomerId: (v: number) => void;
  tradeInVehicleId: number;
  setTradeInVehicleId: (v: number) => void;
  tradeInCondition: 'excellent' | 'good' | 'fair';
  setTradeInCondition: (v: 'excellent' | 'good' | 'fair') => void;
  tradeInQuoteLoading: boolean;
  handleCreateTradeInQuote: () => void;
}

export function ValuationTab({
  vinInput,
  setVinInput,
  valuationResult,
  valuationLoading,
  valuationError,
  handleVinAppraise,
  customers,
  allVehicles,
  tradeInCustomerId,
  setTradeInCustomerId,
  tradeInVehicleId,
  setTradeInVehicleId,
  tradeInCondition,
  setTradeInCondition,
  tradeInQuoteLoading,
  handleCreateTradeInQuote,
}: ValuationTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Trade-in Valuation</PageTitle>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 mb-4">Enter the customer's trade-in vehicle VIN to decode specs and get an estimated trade-in value.</p>
        <div className="flex items-center space-x-3 max-w-xl">
          <input
            type="text"
            value={vinInput}
            onChange={e => setVinInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleVinAppraise()}
            placeholder="Enter 17-char VIN (e.g. 1HGCM82633A004352)"
            maxLength={17}
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border font-mono uppercase"
          />
          <button
            onClick={handleVinAppraise}
            disabled={valuationLoading || vinInput.length < 11}
            className="bg-brand-yellow text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center"
          >
            {valuationLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Decoding...</> : 'Appraise'}
          </button>
        </div>
        {valuationError && <p className="text-red-600 text-sm mt-3">{valuationError}</p>}
      </div>

      {valuationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Vehicle Details</h3>
            <dl className="space-y-3">
              {[
                ['VIN', valuationResult.vin],
                ['Year / Make / Model', `${valuationResult.year} ${valuationResult.make} ${valuationResult.model}`],
                ['Trim', valuationResult.trim],
                ['Body Class', valuationResult.bodyClass],
                ['Engine Cylinders', valuationResult.engineCylinders],
                ['Fuel Type', valuationResult.fuelType],
                ['Drive Type', valuationResult.driveType],
                ['Manufacturer', valuationResult.manufacturer],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Trade-in Estimate</h3>

            {/* Condition selector — adjusts the trade-in value displayed */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Vehicle Condition</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'excellent', label: 'Excellent', multiplier: 1.15, color: 'green' },
                  { value: 'good',      label: 'Good',      multiplier: 1.0,  color: 'yellow' },
                  { value: 'fair',      label: 'Fair',      multiplier: 0.8,  color: 'red' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTradeInCondition(opt.value)}
                    className={`rounded-lg border-2 py-2 text-sm font-semibold transition-all ${
                      tradeInCondition === opt.value
                        ? opt.color === 'green'  ? 'border-green-500 bg-green-50 text-green-700'
                        : opt.color === 'yellow' ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                        :                          'border-red-400 bg-red-50 text-red-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                    <span className="block text-xs font-normal mt-0.5">
                      ${Math.round(valuationResult.estimatedTradeIn * opt.multiplier).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected trade-in value */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <p className="text-4xl font-bold text-brand-yellow">
                ${Math.round(valuationResult.estimatedTradeIn * (tradeInCondition === 'excellent' ? 1.15 : tradeInCondition === 'fair' ? 0.8 : 1.0)).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Trade-in allowance · subject to physical inspection</p>
            </div>

            {/* Customer selection */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={tradeInCustomerId}
                onChange={setTradeInCustomerId}
                placeholder="Select customer…"
                loadingText="Loading customers…"
              />
            </div>

            {/* Vehicle they want to buy */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle to Purchase</label>
              <select
                value={tradeInVehicleId}
                onChange={e => setTradeInVehicleId(Number(e.target.value))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-brand-yellow focus:border-brand-yellow"
              >
                <option value={0}>— Select an available vehicle —</option>
                {allVehicles.filter((v: any) => v.status === 'AVAILABLE').map((v: any) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.year} {v.make} {v.model} — ${Number(v.msrp || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateTradeInQuote}
              disabled={tradeInQuoteLoading || !tradeInCustomerId || !tradeInVehicleId}
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {tradeInQuoteLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Quote…</>
                : 'Create Trade-in Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DealsTab ──────────────────────────────────────────────────────────────────

export interface DealsTabProps {
  deals: any[];
  tabLoading: boolean;
  approveDeal: (dealId: number) => void;
  rejectDeal: (dealId: number) => void;
  finalizeDeal: (dealId: number) => void;
}

export function DealsTab({ deals, tabLoading, approveDeal, rejectDeal, finalizeDeal }: DealsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Deal Approvals</PageTitle>
      </div>
      <TableCard>
          <TableHead cols={['Deal ID', 'Quote', 'Sales Person', 'Status', 'Actions']} right={[4]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {tabLoading ? (
              <TableLoader cols={5} />
            ) : deals.length === 0 ? (
              <TableEmpty cols={5} message="No deals found." />
            ) : deals.map((d: any) => (
              <tr key={d.dealId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{d.dealId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">QT-{d.quoteId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">User #{d.salesPersonId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {d.status === 'PENDING' && (
                    <>
                      <button onClick={() => approveDeal(d.dealId)} className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                      <button onClick={() => rejectDeal(d.dealId)} className="text-red-500 hover:text-red-800 font-medium">Reject</button>
                    </>
                  )}
                  {d.status === 'APPROVED' && (
                    <button onClick={() => finalizeDeal(d.dealId)} className="text-brand-yellow hover:text-yellow-600 font-bold">Finalize & Invoice</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── CommissionsTab ────────────────────────────────────────────────────────────

export interface CommissionsTabProps {
  commissions: any[];
  tabLoading: boolean;
}

export function CommissionsTab({ commissions, tabLoading }: CommissionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>My Commissions</PageTitle>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-brand-yellow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Earned</h3>
          <p className="text-3xl font-bold text-gray-900">${commissions.reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Paid Out</h3>
          <p className="text-3xl font-bold text-gray-900">${commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Payout</h3>
          <p className="text-3xl font-bold text-gray-900">${commissions.filter(c => c.status !== 'PAID').reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <TableCard>
          <TableHead cols={['Commission ID', 'Deal ID', 'Status', 'Calculated At', 'Amount']} right={[4]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {tabLoading ? (
              <TableLoader cols={5} />
            ) : commissions.length === 0 ? (
              <TableEmpty cols={5} message="No commissions recorded. Commissions are calculated automatically when a deal is finalized." />
            ) : commissions.map((c: any) => (
              <tr key={c.commissionId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.commissionId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.dealId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {c.calculatedAt ? new Date(c.calculatedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">+${Number(c.commissionAmount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── NotificationsTab ──────────────────────────────────────────────────────────

export interface NotificationsTabProps {
  userId: number | undefined;
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
  return (
    <NotificationsPanel userId={userId} theme="light" limit={5} />
  );
}
