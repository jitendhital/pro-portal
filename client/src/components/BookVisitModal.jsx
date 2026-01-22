import { useState } from 'react';
import { FaCalendarAlt, FaClock, FaComment, FaTimes, FaCheckCircle } from 'react-icons/fa';

const TIME_SLOTS = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
];

export default function BookVisitModal({ listing, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        date: '',
        timeSlot: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Get maximum date (30 days from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.timeSlot) {
            setError('Please select both date and time slot');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/booking/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    listingId: listing._id,
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    message: formData.message,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                setError(data.message || 'Failed to book visit');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess && onSuccess(data.booking);
                onClose();
            }, 2000);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md transform transition-all duration-300 animate-modal-appear">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-2xl">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FaCalendarAlt />
                                Book a Visit
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-emerald-100 truncate">
                            {listing.name}
                        </p>
                    </div>

                    {/* Success State */}
                    {success ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-bounce-once">
                                <FaCheckCircle className="text-3xl text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">
                                Booking Request Sent!
                            </h3>
                            <p className="mt-2 text-slate-600">
                                The property owner will review your request.
                            </p>
                        </div>
                    ) : (
                        /* Form */
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Date Picker */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaCalendarAlt className="text-emerald-500" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700 
                           focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20
                           transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Time Slot Selector */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaClock className="text-emerald-500" />
                                    Select Time Slot
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TIME_SLOTS.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                        ${formData.timeSlot === slot
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <FaComment className="text-emerald-500" />
                                    Message (optional)
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Any special requests or questions..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-700
                           placeholder:text-slate-400 resize-none
                           focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20
                           transition-all duration-200"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 
                         px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30
                         hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/40
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending Request...
                                    </span>
                                ) : (
                                    'Request Visit'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
