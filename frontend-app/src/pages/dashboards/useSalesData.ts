import { useState, useEffect } from 'react';
import axios from 'axios';

export function useSalesTabData(
  activeTab: string,
  userId: number | undefined,
) {
  const [leads, setLeads] = useState<any[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');

  useEffect(() => {
    setTabLoading(true);
    setTabError('');
    if (activeTab === 'leads') {
      Promise.all([
        axios.get('http://localhost:8089/api/leads').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/sales/test-drives').catch(() => ({ data: [] })),
      ]).then(([leadsRes, tdRes]) => {
        setLeads(leadsRes.data || []);
        setTestDrives(tdRes.data || []);
      }).catch(() => {
        setTabError('Could not load leads. Please check your permissions.');
      }).finally(() => setTabLoading(false));
    } else if (activeTab === 'inventory') {
      axios.get('http://localhost:8089/api/inventory/vehicles')
        .then(res => setInventory(res.data || []))
        .catch(() => { setInventory([]); setTabError('Could not load inventory.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'quotes') {
      axios.get('http://localhost:8089/api/sales/quotes')
        .then(res => setQuotes(res.data || []))
        .catch(() => { setQuotes([]); setTabError('Could not load quotes.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'approvals') {
      axios.get('http://localhost:8089/api/sales/deals')
        .then(res => setDeals(res.data || []))
        .catch(() => { setDeals([]); setTabError('Could not load deals.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'commissions') {
      const url = userId
        ? `http://localhost:8089/api/sales/commissions/salesperson/${userId}`
        : 'http://localhost:8089/api/sales/commissions';
      axios.get(url)
        .then(res => setCommissions(res.data || []))
        .catch(() => { setCommissions([]); setTabError('Could not load commissions.'); })
        .finally(() => setTabLoading(false));
    } else {
      setTabLoading(false);
    }
  }, [activeTab, userId]);

  return {
    leads, setLeads,
    testDrives, setTestDrives,
    inventory,
    quotes, setQuotes,
    deals, setDeals,
    commissions,
    tabLoading,
    tabError,
  };
}
