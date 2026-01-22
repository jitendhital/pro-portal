import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaClock,
    FaMapMarkerAlt,
    FaCheck,
    FaTimes,
    FaSpinner,
    FaUser,
    FaEnvelope,
    FaComment,
    FaHome
} from 'react-icons/fa';

const STATUS_CONFIG = {
    pending: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        icon: '⏳',
    },
    approved: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        icon: '✓',
    },
    rejected: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700',
        icon: '✗',
    },
    cancelled: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-500',
        badge: 'bg-slate-100 text-slate-500',
        icon: '○',
    },
};

export default function BookingCard({ booking, type, onStatusUpdate, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [sellerNote, setSellerNote] = useState('');

    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    const isSeller = type === 'seller';
    const isPending = booking.status === 'pending';
    const canCancel = type === 'buyer' && ['pending', 'approved'].includes(booking.status);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/booking/status/${booking._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    status: newStatus,
                    sellerNote: sellerNote || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                onStatusUpdate && onStatusUpdate(booking._id, newStatus);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
            setShowNote(false);
            setSellerNote('');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/booking/${booking._id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await res.json();

            if (data.success) {
                onCancel && onCancel(booking._id);
            }
        } catch (error) {
            console.error('Failed to cancel booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const otherUser = isSeller ? booking.buyer : booking.seller;
    const listing = booking.listing;

    return (
        <div className={`rounded-2xl border-2 ${status.border} ${status.bg} p-4 transition-all duration-300 hover:shadow-lg`}>
            {/* Header */}
            <div className="flex items-start gap-4">
                {/* Property Image */}
                <Link to={`/listing/${listing._id}`} className="shrink-0">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden group">
                        <img
                            src={listing.imageUrls?.[0] || '/placeholder.jpg'}
                            alt={listing.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                </Link>

                {/* Property & Booking Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <Link
                            to={`/listing/${listing._id}`}
                            className="text-lg font-semibold text-slate-800 hover:text-emerald-600 
                       transition-colors line-clamp-1"
                        >
                            {listing.name}
                        </Link>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                            {status.icon} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                    </div>

                    <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                        <FaMapMarkerAlt className="text-emerald-500" />
                        <span className="truncate">{listing.address}</span>
                    </p>

                    {/* Date & Time */}
                    <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                            <FaCalendarAlt className="text-emerald-500" />
                            {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                            <FaClock className="text-emerald-500" />
                            {booking.timeSlot}
                        </span>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/60">
                <img
                    src={otherUser?.avatar || '/default-avatar.png'}
                    alt={otherUser?.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                        <FaUser className="text-slate-400" />
                        {otherUser?.username}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <FaEnvelope className="text-slate-400" />
                        {otherUser?.email}
                    </p>
                </div>
                <span className="text-xs text-slate-400">
                    {isSeller ? 'Visitor' : 'Property Owner'}
                </span>
            </div>

            {/* Message */}
            {booking.message && (
                <div className="mt-3 p-3 rounded-xl bg-white/60">
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <FaComment className="text-slate-400" />
                        {isSeller ? "Visitor's Message" : "Your Message"}
                    </p>
                    <p className="text-sm text-slate-700">{booking.message}</p>
                </div>
            )}

            {/* Seller Note (for buyer) */}
            {!isSeller && booking.sellerNote && (
                <div className="mt-3 p-3 rounded-xl bg-white/60">
                    <p className="text-xs text-slate-500 mb-1">Owner's Note</p>
                    <p className="text-sm text-slate-700">{booking.sellerNote}</p>
                </div>
            )}

            {/* Actions */}
            {(isPending && isSeller) && (
                <div className="mt-4 space-y-3">
                    {showNote ? (
                        <div className="space-y-2">
                            <textarea
                                value={sellerNote}
                                onChange={(e) => setSellerNote(e.target.value)}
                                placeholder="Add a note (optional)..."
                                rows={2}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 
                           px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600
                           disabled:opacity-50 transition-all"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                    Confirm Approve
                                </button>
                                <button
                                    onClick={() => setShowNote(false)}
                                    className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNote(true)}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 
                         px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30
                         hover:bg-emerald-600 hover:shadow-xl disabled:opacity-50 transition-all"
                            >
                                <FaCheck />
                                Approve
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('rejected')}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white
                         px-4 py-2.5 text-sm font-medium text-red-600 border-2 border-red-200
                         hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-all"
                            >
                                {loading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Cancel button for buyer */}
            {canCancel && (
                <div className="mt-4">
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white
                     px-4 py-2.5 text-sm font-medium text-slate-600 border-2 border-slate-200
                     hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                        Cancel Booking
                    </button>
                </div>
            )}

            {/* Timestamp */}
            <p className="mt-3 text-xs text-slate-400 text-right">
                Requested {new Date(booking.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}
