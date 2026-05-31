import React, { useState } from "react";
import { X, Calendar, AlertTriangle, Check, Loader2, ShieldCheck, MapPin } from "lucide-react";

export default function CancelBookingModal({ isOpen, onClose, booking, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !booking) return null;

  const listing = booking.listing || {};
  const isPaid = booking.paymentStatus === "paid";
  const refundAmount = booking.totalPrice || 0;

  const handleCancelClick = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm(booking._id);
      setLoading(false);
      setSuccess(true);
      
      // Auto close after 2 seconds to let the checkmark animate
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to cancel reservation. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-[430px] bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header - Brand Bar */}
        <div className="bg-gradient-to-r from-red-900 to-red-950 px-6 py-5 flex items-center justify-between relative">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center uppercase">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 mr-2 shrink-0 animate-pulse" />
              Cancel Reservation
            </h3>
            <p className="text-[10px] font-semibold text-red-200 uppercase tracking-widest">AntiGravity Stays</p>
          </div>
          <button 
            disabled={loading || success}
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Dynamic State Overlay */}
        {success ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[300px] animate-scale-in">
            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center ring-8 ring-emerald-950/30 text-white">
              <Check className="h-8 w-8 stroke-[3.5]" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-lg text-emerald-400">Reservation Cancelled!</h4>
              <p className="text-xs text-slate-400 font-medium">Your refund is being processed automatically.</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[300px]">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin stroke-[2.5]" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-200">Processing Cancellation...</h4>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold">Initiating transaction refund</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Listing details card inside modal */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 text-left">
              <img 
                src={listing.image?.url || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200"}
                alt={listing.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
              />
              <div className="min-w-0">
                <h4 className="font-extrabold text-xs text-slate-450 uppercase tracking-wider truncate">{listing.title}</h4>
                <p className="font-bold text-sm text-white mt-0.5 truncate flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                  {listing.location}, {listing.country}
                </p>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 mt-2 bg-slate-950 py-1 px-2 rounded-lg border border-slate-850 w-fit">
                  <Calendar className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span>{new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span>-</span>
                  <span>{new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Refund detail section */}
            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-left space-y-2">
              <h4 className="font-extrabold text-xs text-red-400 uppercase tracking-wider">Refund Policy & Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {isPaid ? (
                  <>
                    This reservation has been fully paid. A total of <span className="text-white font-extrabold">₹{refundAmount.toLocaleString()}</span> will be refunded back to your original payment method automatically.
                  </>
                ) : (
                  <>
                    This reservation is unpaid. No payment was charged, and the reservation will be canceled instantly.
                  </>
                )}
              </p>
              {isPaid && (
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold mt-2 pt-2 border-t border-red-900/20">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Zero cancellation fees apply.</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold bg-red-950/20 border border-red-900/30 p-3 rounded-xl text-left">
                {error}
              </p>
            )}

            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="py-3 bg-slate-900 hover:bg-slate-850 text-white font-extrabold rounded-xl border border-slate-800 text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-750 hover:to-rose-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition shadow-lg shadow-red-900/20"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
