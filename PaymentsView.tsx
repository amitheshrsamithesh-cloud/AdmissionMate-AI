import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  Receipt,
  FileCheck,
  RefreshCw,
  Key,
  Lock,
  ExternalLink
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { College, PaymentRecord, StudentProfile } from '../types';

interface PaymentsViewProps {
  colleges: College[];
  student: StudentProfile;
  payments: PaymentRecord[];
  onPaymentSuccess: (payment: PaymentRecord, collegeId: string) => void;
  setActiveSection: (section: string) => void;
}

interface PayPalConfig {
  clientId: string;
  currency: string;
  environment: string;
  configured: boolean;
}

export default function PaymentsView({
  colleges,
  student,
  payments,
  onPaymentSuccess,
  setActiveSection,
}: PaymentsViewProps) {
  // Pre-select first unpaid college or first college
  const unpaidColleges = colleges.filter((c) => !c.feePaid);
  const defaultCollege = unpaidColleges.length > 0 ? unpaidColleges[0] : colleges[0];

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(defaultCollege?.id || 'col-1');
  const [selectedCollege, setSelectedCollege] = useState<College>(defaultCollege);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<PaymentRecord | null>(null);

  // Real backend PayPal configuration state
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Fetch PayPal configuration from backend
  const fetchPayPalConfig = async () => {
    setLoadingConfig(true);
    setPaymentError(null);
    try {
      const res = await fetch('/api/paypal/config');
      if (res.ok) {
        const data = await res.json();
        setPaypalConfig(data);
      } else {
        setPaypalConfig({ clientId: '', currency: 'USD', environment: 'sandbox', configured: false });
      }
    } catch (err) {
      console.error('Error fetching PayPal config:', err);
      setPaypalConfig({ clientId: '', currency: 'USD', environment: 'sandbox', configured: false });
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchPayPalConfig();
  }, []);

  // Update selected college reference if colleges prop updates
  useEffect(() => {
    const found = colleges.find((c) => c.id === selectedCollegeId);
    if (found) setSelectedCollege(found);
  }, [colleges, selectedCollegeId]);

  const handleSelectCollege = (colId: string) => {
    setSelectedCollegeId(colId);
    const col = colleges.find((c) => c.id === colId);
    if (col) setSelectedCollege(col);
    setPaymentError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E6F0F0] dark:bg-[#006A6A]/20 text-[#006A6A] dark:text-teal-400 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                College Application Fee Payments
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Official PayPal Sandbox REST API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Process university application fees with verified server-side orders and captures. Simulated payments are strictly prohibited.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayPalConfig}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingConfig ? 'animate-spin' : ''}`} />
            Refresh Config
          </button>
        </div>
      </div>

      {/* Main Grid: College Selection & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: College Selection */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            Select Target University
          </h3>
          <div className="space-y-2">
            {colleges.map((col) => {
              const isSelected = col.id === selectedCollegeId;
              return (
                <div
                  key={col.id}
                  onClick={() => handleSelectCollege(col.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#006A6A] bg-teal-50/50 dark:bg-[#006A6A]/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                        {col.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Deadline: {col.deadlines.split(',')[0]}
                      </p>
                    </div>
                    {col.feePaid ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="text-sm font-bold font-mono text-[#006A6A] dark:text-teal-400">
                        ${col.applicationFee}.00 USD
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sandbox Testing Guide Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-[#006A6A] dark:text-teal-400" />
              PayPal Sandbox Testing Guide
            </div>
            <p className="text-[11px] leading-relaxed">
              To test real transactions in PayPal Sandbox:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <li>Configure <code className="font-mono text-slate-700 dark:text-slate-200">PAYPAL_CLIENT_ID</code> and <code className="font-mono text-slate-700 dark:text-slate-200">PAYPAL_CLIENT_SECRET</code> in <code className="font-mono text-slate-700 dark:text-slate-200">.env</code>.</li>
              <li>Log in to <a href="https://developer.paypal.com/dashboard/accounts" target="_blank" rel="noreferrer" className="text-[#006A6A] dark:text-teal-400 underline font-medium inline-flex items-center gap-0.5">developer.paypal.com <ExternalLink className="h-2.5 w-2.5" /></a> and retrieve your Sandbox Personal (Buyer) account.</li>
              <li>Click the PayPal button on this page and sign in with your Sandbox Buyer account to authorize capture.</li>
              <li>The server verifies the PayPal capture before recording the transaction.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#006A6A] dark:text-teal-400">
                  Application Processing Invoice
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {selectedCollege?.name}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-black font-mono text-slate-800 dark:text-white">
                  ${selectedCollege?.applicationFee}.00
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block">USD Currency</span>
              </div>
            </div>

            {/* Applicant details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Applicant Name</span>
                <span className="font-semibold text-slate-800 dark:text-white">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Target Degree</span>
                <span className="font-semibold text-slate-800 dark:text-white">{student.course}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Applicant Email</span>
                <span className="font-semibold text-slate-800 dark:text-white truncate block">{student.email}</span>
              </div>
            </div>

            {/* Fee Itemization */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-700/60 my-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Admissions Committee Processing Fee ({selectedCollege?.name})</span>
                <span className="font-mono font-bold">${selectedCollege?.applicationFee}.00 USD</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Payment Settlement Gateway</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">PayPal Sandbox REST API v2</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-800 dark:text-white text-sm">
                <span>Total Amount Due</span>
                <span className="font-mono text-[#006A6A] dark:text-teal-400">
                  ${selectedCollege?.applicationFee}.00 USD
                </span>
              </div>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Check Configuration Status */}
            {loadingConfig ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-[#006A6A]" />
                Verifying PayPal Sandbox configuration...
              </div>
            ) : !paypalConfig?.configured ? (
              /* Configuration Required Card (Checkout Disabled) */
              <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200 font-bold text-sm">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  PayPal Sandbox Configuration Required
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Real PayPal Sandbox credentials must be configured on the server to enable checkout. Simulated fake payment success has been strictly removed to ensure payment integrity.
                </p>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="text-slate-400 dark:text-slate-500 font-sans text-[10px]">Required in your .env file:</p>
                  <p className="text-[#006A6A] dark:text-teal-400">PAYPAL_CLIENT_ID="&lt;your_sandbox_client_id&gt;"</p>
                  <p className="text-[#006A6A] dark:text-teal-400">PAYPAL_CLIENT_SECRET="&lt;your_sandbox_client_secret&gt;"</p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={fetchPayPalConfig}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Check Configuration Again
                  </button>
                  <a
                    href="https://developer.paypal.com/dashboard/applications/sandbox"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100/50 transition inline-flex items-center gap-1"
                  >
                    Get Sandbox Keys <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : selectedCollege?.feePaid ? (
              /* If Already Paid */
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-full">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      Application Fee Paid & Captured
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Order ID: {selectedCollege.paymentOrderId || 'Verified PayPal Sandbox Order'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const match = payments.find((p) => p.collegeId === selectedCollege.id || p.collegeName === selectedCollege.name);
                    if (match) setActiveReceipt(match);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Receipt className="h-4 w-4" />
                  View Verified Receipt
                </button>
              </div>
            ) : (
              /* PayPal Official SDK Buttons (Active when configured) */
              <div className="space-y-4 pt-3">
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Pay securely with PayPal Sandbox
                  </span>
                </div>

                <div className="max-w-md mx-auto">
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalConfig.clientId, // Actual public PAYPAL_CLIENT_ID from server
                      currency: paypalConfig.currency || 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay',
                      }}
                      createOrder={async () => {
                        setIsProcessing(true);
                        setPaymentError(null);
                        try {
                          const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              collegeId: selectedCollege.id, // Backend looks up trusted amount & name
                              studentEmail: student.email,
                              studentName: student.name,
                            }),
                          });
                          if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.message || errData.error || 'Failed to create PayPal order');
                          }
                          const data = await res.json();
                          return data.orderId;
                        } catch (err: any) {
                          setPaymentError(err.message || 'Could not create PayPal order');
                          setIsProcessing(false);
                          throw err;
                        }
                      }}
                      onApprove={async (data) => {
                        try {
                          const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              orderId: data.orderId,
                              collegeId: selectedCollege.id,
                            }),
                          });
                          if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.message || errData.error || 'Payment capture failed');
                          }
                          const result = await res.json();
                          onPaymentSuccess(result.payment, selectedCollege.id);
                          setPaymentSuccessModal(result.payment);
                        } catch (err: any) {
                          setPaymentError(err.message || 'Could not capture PayPal payment');
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      onError={(err) => {
                        console.error('PayPal Button Error:', err);
                        setPaymentError('PayPal checkout encountered an issue. Ensure your PayPal Sandbox buyer account is active.');
                        setIsProcessing(false);
                      }}
                      onCancel={() => {
                        setIsProcessing(false);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Payment History Table (Actual Verified Payments Only) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#006A6A] dark:text-teal-400" />
              Verified Application Fee Payment Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Persistent records of actual PayPal Sandbox transactions. Pre-populated mock payments are excluded.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
            {payments.length} Verified Records
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No application fee payments recorded yet. Complete a PayPal Sandbox checkout above to register your first verified transaction.
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-mono uppercase text-[11px]">
                  <th className="py-3 px-3">University</th>
                  <th className="py-3 px-3">PayPal Order ID</th>
                  <th className="py-3 px-3">PayPal Capture ID</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-white">
                      {p.collegeName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.orderId}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#006A6A] dark:text-teal-400 font-semibold">
                      {p.captureId}
                    </td>
                    <td className="py-3.5 px-3 font-bold font-mono text-slate-800 dark:text-white">
                      ${p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#006A6A] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-[#006A6A]/20 rounded-md transition"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Success Modal */}
      {paymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">
                Payment Captured by PayPal!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your payment was verified by PayPal's Sandbox API and permanently recorded in the ledger.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2 text-xs border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">University:</span>
                <span className="font-bold text-slate-800 dark:text-white">{paymentSuccessModal.collegeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold font-mono text-[#006A6A] dark:text-teal-400">
                  ${paymentSuccessModal.amount.toFixed(2)} {paymentSuccessModal.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{paymentSuccessModal.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Capture ID:</span>
                <span className="font-mono text-[11px] text-[#006A6A] dark:text-teal-400 font-bold">{paymentSuccessModal.captureId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{paymentSuccessModal.receiptNumber}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const receipt = paymentSuccessModal;
                  setPaymentSuccessModal(null);
                  setActiveReceipt(receipt);
                }}
                className="flex-1 py-2.5 px-3 bg-[#E6F0F0] dark:bg-[#006A6A]/20 text-[#006A6A] dark:text-teal-400 rounded-xl text-xs font-bold hover:bg-teal-100 transition"
              >
                Print Official Receipt
              </button>
              <button
                onClick={() => setPaymentSuccessModal(null)}
                className="flex-1 py-2.5 px-3 bg-[#006A6A] hover:bg-[#005252] text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#006A6A] dark:text-teal-400" />
                <span className="font-bold text-slate-800 dark:text-white text-sm">
                  Official Admission Fee Receipt
                </span>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Container */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-4 text-xs font-sans">
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-base tracking-tight text-slate-900 dark:text-white uppercase font-display">
                  {activeReceipt.collegeName}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Office of Undergraduate Admissions • Payment Clearing Ledger
                </p>
                <span className="inline-block mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 rounded">
                  TRANSACTION STATUS: COMPLETED (PAYPAL SANDBOX)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Applicant Name:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{activeReceipt.payerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeReceipt.payerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{activeReceipt.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Date & Time:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(activeReceipt.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Order ID:</span>
                  <span className="font-mono text-slate-800 dark:text-white">{activeReceipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal Capture ID:</span>
                  <span className="font-mono text-[#006A6A] dark:text-teal-400 font-bold">{activeReceipt.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-mono text-slate-800 dark:text-white">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-300 dark:border-slate-600 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white text-sm">Amount Paid:</span>
                <span className="font-black font-mono text-lg text-[#006A6A] dark:text-teal-400">
                  ${activeReceipt.amount.toFixed(2)} {activeReceipt.currency}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 bg-[#006A6A] hover:bg-[#005252] text-white rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
