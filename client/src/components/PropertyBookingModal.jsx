import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCalendarAlt, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

export default function PropertyBookingModal({ listing, onClose }) {
    const { currentUser } = useSelector((state) => state.user);
    const { success, error: showError } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        message: '',
    });

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            showError('Please sign in to book a property');
            navigate('/signIn');
            return;
        }

        if (!formData.date) {
            showError('Please select a preferred date');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/booking/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    propertyId: listing._id,
                    date: formData.date,
                    message: formData.message,
                    bookingType: 'property', // Explicitly mark as property booking
                    totalPrice: 0, // No immediate price for sale/rent bookings
                }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                showError(data.message || 'Failed to submit booking request');
                return;
            }

            setSubmitted(true);
            success('Booking request submitted successfully!');

            setTimeout(() => {
                onClose();
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-slide-in-right">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <FaCheckCircle className="text-5xl text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Request Submitted!</h2>
                    <p className="text-slate-600 mb-6">
                        Your request to book <strong>{listing.name}</strong> has been sent to the owner.
                        They will review and approve your request soon.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3 text-left">
                        <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                            Note: Once approved, please contact the owner within 48 hours to finalize the process, or the booking may be removed.
                        </p>
                    </div>
                    <p className="text-sm text-slate-400">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-purple-800">Book Property</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h3 className="font-semibold text-purple-900">{listing.name}</h3>
                        <p className="text-sm text-purple-700">{listing.address}</p>
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
                            <FaCalendarAlt className="inline mr-2 text-purple-600" />
                            Proposed Visit/Finalization Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={getMinDate()}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                            Message to Owner (Optional)
                        </label>
                        <textarea
                            id="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="E.g., I'm interested in buying/renting this property and would like to discuss the next steps."
                        />
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                        <FaInfoCircle className="text-amber-500 mt-1 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                            By submitting this request, you agree that the lister has the right to remove the booking if you fail to establish contact within 48 hours after approval.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? 'Submitting Request...' : 'Submit Booking Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
