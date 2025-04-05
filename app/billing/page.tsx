'use client';

import { useEffect, useState } from 'react';

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string;
  hosted_invoice_url: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setInvoices(data.invoices);
        }
      } catch (err) {
        setError('Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg font-light tracking-wider">LOADING...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light tracking-wider mb-8">BILLING HISTORY</h1>
        
        {invoices.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-white/60">No billing history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-center justify-between"
              >
                <div>
                  <p className="font-light tracking-wider">
                    {formatDate(invoice.created)}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    {formatAmount(invoice.amount_paid, invoice.currency)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded text-sm ${
                    invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                    invoice.status === 'open' ? 'bg-blue-500/10 text-blue-500' : 
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </div>
                  
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    VIEW
                  </a>
                  
                  {invoice.invoice_pdf && (
                    <a
                      href={invoice.invoice_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 