import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';

/**
 * Booking Summary Page
 * Displays detailed booking information after submission
 */
export default function BookingSummary() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/booking/get/${bookingId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
          setError(data.message || 'Failed to fetch booking');
          setLoading(false);
          return;
        }

        setBooking(data.booking);
      } catch (error) {
        setError('An error occurred. Please try again.');
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader type="listing-detail" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const property = booking.propertyId || {};
  const seller = booking.sellerId || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-purple-800 mb-2">Booking Confirmed!</h1>
          <p className="text-purple-600">Your booking request has been submitted successfully</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-purple-800">Booking Details</h2>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Info */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Property Information</h3>
              {property.imageUrls && property.imageUrls[0] && (
                <img
                  src={property.imageUrls[0]}
                  alt={property.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h4 className="text-xl font-bold text-purple-800 mb-2">{property.name || 'Property'}</h4>
              <p className="text-purple-600 flex items-center gap-2 mb-4">
                <FaMapMarkerAlt />
                {property.address || 'Address not available'}
              </p>
            </div>

            {/* Booking Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Booking Information</h3>
              
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Check-in Date</p>
                  <p className="font-semibold text-purple-800">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaUsers className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Time Slot</p>
                  <p className="font-semibold text-purple-800">{booking.timeSlot}</p>
                </div>
              </div>

              {booking.numberOfGuests && (
                <div className="flex items-center gap-3">
                  <FaUsers className="text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Number of Guests</p>
                    <p className="font-semibold text-purple-800">{booking.numberOfGuests}</p>
                  </div>
                </div>
              )}

              {booking.addOns && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Add-ons</p>
                  <div className="space-y-1">
                    {booking.addOns.bbq?.enabled && (
                      <p className="text-purple-800">• BBQ Service</p>
                    )}
                    {booking.addOns.campfire?.enabled && (
                      <p className="text-purple-800">• Campfire</p>
                    )}
                    {booking.addOns.soundSystem?.enabled && (
                      <p className="text-purple-800">• Sound System</p>
                    )}
                  </div>
                </div>
              )}

              {booking.totalPrice && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rs {parseFloat(booking.totalPrice).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {booking.message && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">Message</p>
              <p className="text-purple-800">{booking.message}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            View All Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

