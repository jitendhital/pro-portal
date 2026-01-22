import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarCheck,
    FaHome,
    FaInbox,
    FaSpinner,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaBan
} from 'react-icons/fa';
import BookingCard from '../components/BookingCard';

export default function Dashboard() {
    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'bookings'
    const [sellerBookings, setSellerBookings] = useState([]);
    const [buyerBookings, setBuyerBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/signIn');
            return;
        }
        fetchBookings();
    }, [currentUser]);

    const fetchBookings = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch both seller and buyer bookings in parallel
            const [sellerRes, buyerRes] = await Promise.all([
                fetch(`/api/booking/seller/${currentUser._id}`, { credentials: 'include' }),
                fetch(`/api/booking/buyer/${currentUser._id}`, { credentials: 'include' }),
            ]);

            const sellerData = await sellerRes.json();
            const buyerData = await buyerRes.json();

            if (sellerData.success) {
                setSellerBookings(sellerData.bookings || []);
            }
            if (buyerData.success) {
                setBuyerBookings(buyerData.bookings || []);
            }
        } catch (err) {
            setError('Failed to load bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (bookingId, newStatus) => {
        setSellerBookings(prev =>
            prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
        );
    };

    const handleCancel = (bookingId) => {
        setBuyerBookings(prev =>
            prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
    };

    // Calculate stats
    const sellerStats = {
        pending: sellerBookings.filter(b => b.status === 'pending').length,
        approved: sellerBookings.filter(b => b.status === 'approved').length,
        rejected: sellerBookings.filter(b => b.status === 'rejected').length,
    };

    const buyerStats = {
        pending: buyerBookings.filter(b => b.status === 'pending').length,
        approved: buyerBookings.filter(b => b.status === 'approved').length,
        cancelled: buyerBookings.filter(b => b.status === 'cancelled').length,
    };

    const pendingRequests = sellerBookings.filter(b => b.status === 'pending');
    const otherSellerBookings = sellerBookings.filter(b => b.status !== 'pending');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaCalendarCheck className="text-emerald-200" />
                        Dashboard
                    </h1>
                    <p className="mt-2 text-emerald-100">
                        Manage your property visits and booking requests
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <FaClock className="text-amber-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{sellerStats.pending}</p>
                                <p className="text-sm text-slate-500">Pending Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FaCheckCircle className="text-emerald-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{sellerStats.approved}</p>
                                <p className="text-sm text-slate-500">Approved Visits</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <FaCalendarCheck className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{buyerStats.pending}</p>
                                <p className="text-sm text-slate-500">My Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <FaHome className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{buyerStats.approved}</p>
                                <p className="text-sm text-slate-500">My Approved</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${activeTab === 'requests'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FaInbox />
                        Visit Requests
                        {sellerStats.pending > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-sm">
                                {sellerStats.pending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${activeTab === 'bookings'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FaCalendarCheck />
                        My Bookings
                        {buyerStats.pending > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-sm">
                                {buyerStats.pending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="ml-auto px-4 py-3 rounded-xl bg-white text-slate-600 hover:bg-slate-50 
                     disabled:opacity-50 transition-all"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : '↻ Refresh'}
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-4" />
                        <p className="text-slate-500">Loading bookings...</p>
                    </div>
                ) : (
                    <>
                        {/* Visit Requests Tab (Seller View) */}
                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                {/* Pending Requests */}
                                {pendingRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <FaClock className="text-amber-500" />
                                            Pending Requests ({pendingRequests.length})
                                        </h2>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {pendingRequests.map((booking) => (
                                                <BookingCard
                                                    key={booking._id}
                                                    booking={booking}
                                                    type="seller"
                                                    onStatusUpdate={handleStatusUpdate}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other Bookings */}
                                {otherSellerBookings.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <FaCheckCircle className="text-emerald-500" />
                                            Past Requests
                                        </h2>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {otherSellerBookings.map((booking) => (
                                                <BookingCard
                                                    key={booking._id}
                                                    booking={booking}
                                                    type="seller"
                                                    onStatusUpdate={handleStatusUpdate}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {sellerBookings.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                        <FaInbox className="mx-auto text-5xl text-slate-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                            No visit requests yet
                                        </h3>
                                        <p className="text-slate-500">
                                            When buyers request to visit your properties, they'll appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Bookings Tab (Buyer View) */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-6">
                                {buyerBookings.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {buyerBookings.map((booking) => (
                                            <BookingCard
                                                key={booking._id}
                                                booking={booking}
                                                type="buyer"
                                                onCancel={handleCancel}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                        <FaCalendarCheck className="mx-auto text-5xl text-slate-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                            No bookings yet
                                        </h3>
                                        <p className="text-slate-500 mb-4">
                                            Start exploring properties and book a visit!
                                        </p>
                                        <button
                                            onClick={() => navigate('/search')}
                                            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium
                               hover:bg-emerald-600 transition-all"
                                        >
                                            Browse Properties
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
