import React, { useState } from "react";
import { X, CreditCard, Smartphone, Check, Loader2, ShieldCheck } from "lucide-react";

export default function RazorpayModal({ amount, listingTitle, isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("card"); // card, upi, netbanking
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // UPI Input
  const [upiId, setUpiId] = useState("");

  if (!isOpen) return null;

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Send verified payment IDs on successful transaction
      setTimeout(() => {
        const randId = Math.random().toString(36).substring(2, 10).toUpperCase();
        onSuccess({
          razorpay_payment_id: `pay_MOCK_${randId}`,
          razorpay_order_id: `order_MOCK_${randId}`,
          razorpay_signature: `sig_MOCK_${randId}`
        });
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-[420px] bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[480px]">
        
        {/* Header - Brand Bar */}
        <div className="bg-[#0961E6] px-6 py-5 flex items-center justify-between relative">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base tracking-tight text-white flex items-center">
              <span className="bg-white text-[#0961E6] text-[10px] font-black px-1.5 py-0.5 rounded mr-2">RP</span>
              AntiGravity Stays
            </h3>
            <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wider">{listingTitle}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black block text-white">&#8377;{amount.toLocaleString()}</span>
            <span className="text-[9px] font-bold text-blue-100 uppercase tracking-wider">Test Sandbox</span>
          </div>
          <button 
            disabled={loading || success}
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Success Overlay state */}
        {success ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 animate-scale-in">
            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center ring-8 ring-emerald-950/20 text-white">
              <Check className="h-8 w-8 stroke-[3.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-lg text-emerald-400">Payment Successful!</h4>
              <p className="text-xs text-slate-400 font-medium">Recording stay reservation in database...</p>
            </div>
          </div>
        ) : loading ? (
          /* Processing Spinner Overlay */
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-[#0961E6] animate-spin stroke-[2.5]" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-200">Processing Payment...</h4>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold">Do not refresh or close window</p>
            </div>
          </div>
        ) : (
          /* Interactive forms screen */
          <>
            {/* Payment Mode Navigation */}
            <div className="flex border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("card")}
                className={`flex-1 py-3.5 font-bold flex items-center justify-center transition border-b-2 ${
                  activeTab === "card" 
                    ? "text-[#0961E6] border-[#0961E6]" 
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <CreditCard className="h-4 w-4 mr-2" /> Card
              </button>
              <button
                onClick={() => setActiveTab("upi")}
                className={`flex-1 py-3.5 font-bold flex items-center justify-center transition border-b-2 ${
                  activeTab === "upi" 
                    ? "text-[#0961E6] border-[#0961E6]" 
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Smartphone className="h-4 w-4 mr-2" /> UPI
              </button>
            </div>

            {/* Content Form container */}
            <form onSubmit={handlePaymentSubmit} className="flex-grow flex flex-col p-6 justify-between">
              <div>
                {activeTab === "card" && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Card details</p>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        required
                        placeholder="Card Number (e.g. 4111 1111 1111)" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-3.5 text-xs bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-[#0961E6] transition text-white font-medium"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          required
                          placeholder="Expiry (MM/YY)" 
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="p-3.5 text-xs bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-[#0961E6] transition text-white font-medium text-center"
                        />
                        <input 
                          type="password" 
                          required
                          maxLength="3"
                          placeholder="CVV" 
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="p-3.5 text-xs bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-[#0961E6] transition text-white font-medium text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "upi" && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">UPI ID / VPA</p>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. user@okhdfcbank" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-3.5 text-xs bg-slate-850 border border-slate-800 rounded-xl outline-none focus:border-[#0961E6] transition text-white font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Submit controls */}
              <div className="space-y-4 mt-6">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0961E6] hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-lg transition duration-200 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Pay &#8377;{amount.toLocaleString()}
                </button>
                <div className="flex items-center justify-center text-slate-500 space-x-1.5 text-[9px] uppercase tracking-wider font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Secured by Razorpay Sandbox</span>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
