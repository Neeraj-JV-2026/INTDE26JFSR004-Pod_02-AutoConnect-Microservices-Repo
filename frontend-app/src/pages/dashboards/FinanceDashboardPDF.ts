import axios from 'axios';

export interface GeneratePDFParams {
  invoices: any[];
  commissions: any[];
  allDeals: any[];
  allQuotes: any[];
  allVehicles: any[];
  customers: any[];
  user: any;
  flash: (type: 'success' | 'error', text: string) => void;
}

export async function generatePDF(
  reportType: string,
  { invoices, commissions, allDeals, allQuotes, allVehicles, customers, user, flash }: GeneratePDFParams
): Promise<void> {
  // Save report record in backend (best-effort, non-blocking)
  try {
    await axios.post('http://localhost:8089/api/finance/reports', {
      type: 'FINANCE',
      filters: JSON.stringify({ reportType }),
      generatedBy: user?.name || 'Finance Officer',
    });
  } catch { /* non-critical */ }

  const now = new Date();

  // ── Invoice summary ──────────────────────────────────────────────
  const totalRevenue = invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const paidRevenue  = invoices.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);

  // ── P&L calculation ───────────────────────────────────────────────
  // Vehicle sale revenue: DEAL-type PAID invoices
  const dealInvoicesPaid = invoices.filter((i: any) => i.relatedEntityType === 'DEAL' && i.status === 'PAID');
  const serviceInvoicesPaid = invoices.filter((i: any) => i.relatedEntityType === 'WORK_ORDER' && i.status === 'PAID');

  let vehicleSalesRevenue = 0;
  let vehicleMSRPCost = 0;
  const plRows: string[] = [];

  dealInvoicesPaid.forEach((inv: any) => {
    vehicleSalesRevenue += inv.totalAmount || 0;
    const deal   = allDeals.find((d: any) => d.dealId === inv.relatedEntityId);
    const quote  = allQuotes.find((q: any) => q.quoteId === deal?.quoteId);
    const vehicle = allVehicles.find((v: any) => v.vehicleId === quote?.vehicleId);
    const msrp   = vehicle?.msrp || 0;
    vehicleMSRPCost += msrp;
    const profit = (inv.totalAmount || 0) - msrp;
    const margin = msrp > 0 ? ((profit / msrp) * 100).toFixed(1) : '—';
    plRows.push(`<tr>
      <td>INV-${inv.invoiceId}</td>
      <td>${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `Deal #${inv.relatedEntityId}`}</td>
      <td>${customers.find((c: any) => c.customerId === inv.customerId)?.name || `#${inv.customerId}`}</td>
      <td style="text-align:right">$${(inv.totalAmount || 0).toLocaleString()}</td>
      <td style="text-align:right">$${msrp.toLocaleString()}</td>
      <td style="text-align:right;font-weight:bold;color:${profit >= 0 ? '#166534' : '#dc2626'}">
        ${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}
      </td>
      <td style="text-align:right">${margin !== '—' ? margin + '%' : '—'}</td>
    </tr>`);
  });

  const serviceRevenue = serviceInvoicesPaid.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
  const grossProfit = vehicleSalesRevenue - vehicleMSRPCost;
  const netRevenue  = vehicleSalesRevenue + serviceRevenue;
  const totalCOGS   = vehicleMSRPCost;
  const totalCommissions = commissions.filter((c: any) => c.status === 'PAID').reduce((s: number, c: any) => s + (c.commissionAmount || 0), 0);
  const netProfit   = grossProfit + serviceRevenue - totalCommissions;
  const overallMargin = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : '0.0';

  const invoiceRows = invoices.map((inv: any) =>
    `<tr>
      <td>INV-${inv.invoiceId}</td>
      <td>${customers.find((c: any) => c.customerId === inv.customerId)?.name || 'Customer #' + inv.customerId}</td>
      <td>${inv.relatedEntityType || '—'}</td>
      <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${inv.status === 'PAID' ? '#d1fae5' : inv.status === 'OVERDUE' ? '#fee2e2' : '#fef9c3'};color:#333">${inv.status}</span></td>
      <td style="text-align:right;font-weight:bold">$${(inv.totalAmount || 0).toLocaleString()}</td>
    </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html><head>
  <title>${reportType} — AutoConnect</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#222}
    .hdr{border-bottom:3px solid #166534;padding-bottom:14px;margin-bottom:22px}
    .hdr h1{margin:0;color:#166534;font-size:26px}
    .hdr p{margin:3px 0;color:#555;font-size:12px}
    .section-title{font-size:15px;font-weight:bold;margin:24px 0 8px;color:#111;border-bottom:2px solid #e5e7eb;padding-bottom:4px}
    .cards{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
    .card{border:1px solid #d1d5db;border-radius:8px;padding:12px 18px;min-width:130px}
    .card .lbl{font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.5px}
    .card .val{font-size:20px;font-weight:bold;color:#166534;margin-top:3px}
    .card .val.loss{color:#dc2626}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    th{background:#166534;color:#fff;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase}
    td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:12px}
    tr:nth-child(even) td{background:#f9fafb}
    .footer{margin-top:36px;padding-top:10px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px}
  </style>
</head><body>
  <div class="hdr">
    <h1>AutoConnect Automotive Group</h1>
    <p><strong>${reportType}</strong></p>
    <p>Generated: ${now.toLocaleString()} &nbsp;|&nbsp; Period: ${now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
  </div>

  <div class="section-title">Profit &amp; Loss Statement</div>
  <div class="cards">
    <div class="card"><div class="lbl">Vehicle Sales Revenue</div><div class="val">$${vehicleSalesRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Service Revenue</div><div class="val">$${serviceRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Total Revenue</div><div class="val">$${netRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Cost (MSRP)</div><div class="val loss">$${totalCOGS.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Gross Profit</div><div class="val ${grossProfit < 0 ? 'loss' : ''}">$${grossProfit.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Commissions Paid</div><div class="val loss">$${totalCommissions.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Net Profit</div><div class="val ${netProfit < 0 ? 'loss' : ''}">$${netProfit.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Net Margin</div><div class="val ${netProfit < 0 ? 'loss' : ''}">${overallMargin}%</div></div>
  </div>

  <div class="section-title">Vehicle Sales Detail (PAID Deals)</div>
  <table>
    <thead><tr><th>Invoice</th><th>Vehicle</th><th>Customer</th><th style="text-align:right">Sale Price</th><th style="text-align:right">MSRP (Cost)</th><th style="text-align:right">Gross Profit</th><th style="text-align:right">Margin</th></tr></thead>
    <tbody>${plRows.length ? plRows.join('') : '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:16px">No finalized vehicle deals in this period</td></tr>'}</tbody>
  </table>

  <div class="section-title">Invoice Summary</div>
  <div class="cards">
    <div class="card"><div class="lbl">Total Invoiced</div><div class="val">$${totalRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Collected</div><div class="val">$${paidRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Outstanding</div><div class="val">${(totalRevenue - paidRevenue).toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Transactions</div><div class="val">${invoices.length}</div></div>
  </div>
  <table>
    <thead><tr><th>Invoice</th><th>Customer</th><th>Type</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${invoiceRows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px">No invoice data loaded — open Invoicing tab first</td></tr>'}</tbody>
  </table>

  <div class="footer">AutoConnect Financial Systems &nbsp;|&nbsp; Report: RPT-${Date.now().toString(36).toUpperCase()} &nbsp;|&nbsp; Confidential — Do Not Distribute</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.addEventListener('load', () => win.print());
  } else {
    flash('error', 'Pop-up blocked — please allow pop-ups for this site and try again.');
  }
}
