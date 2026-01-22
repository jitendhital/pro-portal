import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHome } from 'react-icons/fa';

export default function MyBookings() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/signIn');
      return;
    }
    fetchBookings();
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/booking/get?type=buyer', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to fetch bookings');
        setLoading(false);
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className='p-3 max-w-6xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>My Bookings</h1>
        <p className='text-center text-slate-600'>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className='p-3 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between mb-7'>
        <h1 className='text-3xl font-semibold'>My Bookings</h1>
        <button
          onClick={fetchBookings}
          className='bg-purple-600 text-white rounded-lg px-4 py-2 hover:opacity-95'
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {bookings.length === 0 && !loading && (
        <div className='text-center py-12'>
          <p className='text-slate-600 text-lg'>You haven't made any booking requests yet.</p>
          <p className='text-slate-500 text-sm mt-2'>
            Browse properties and book a visit to see them here.
          </p>
        </div>
      )}

      <div className='flex flex-col gap-4'>
        {bookings.map((booking) => {
          const property = booking.propertyId || {};
          const seller = booking.sellerId || {};

          return (
            <div
              key={booking._id}
              className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col md:flex-row gap-4'>
                {/* Property Image */}
                {property.imageUrls && property.imageUrls[0] && (
                  <div className='md:w-48 flex-shrink-0'>
                    {property._id ? (
                      <Link to={`/listing/${property._id}`}>
                        <img
                          src={property.imageUrls[0]}
                          alt={property.name}
                          className='w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                        />
                      </Link>
                    ) : (
                      <img
                        src={property.imageUrls[0]}
                        alt={property.name}
                        className='w-full h-32 object-cover rounded-lg'
                      />
                    )}
                  </div>
                )}

                {/* Booking Details */}
                <div className='flex-1 flex flex-col gap-3'>
                  <div className='flex items-start justify-between'>
                    <div>
                      {property._id ? (
                        <Link to={`/listing/${property._id}`}>
                          <h3 className='text-xl font-semibold text-slate-800 hover:text-purple-600 cursor-pointer'>
                            {property.name || 'Property'}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className='text-xl font-semibold text-slate-800'>
                          {property.name || 'Property'}
                        </h3>
                      )}
                      <p className='text-sm text-slate-600 flex items-center gap-1 mt-1'>
                        <FaMapMarkerAlt className='text-green-700' />
                        {property.address || 'Address not available'}
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>
                        Seller: {seller.username || seller.email || 'Unknown'}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                    <div className='flex items-center gap-2 text-slate-700'>
                      <FaCalendarAlt className='text-slate-500' />
                      <span>
                        <strong>Date:</strong> {formatDate(booking.date)}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-slate-700'>
                      <FaClock className='text-slate-500' />
                      <span>
                        <strong>Time:</strong> {booking.timeSlot}
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className='bg-slate-50 p-3 rounded-lg'>
                      <p className='text-sm text-slate-700'>
                        <strong>Your Message:</strong> {booking.message}
                      </p>
                    </div>
                  )}

                  <div className='text-xs text-slate-500 pt-2 border-t'>
                    Requested on:{' '}
                    {new Date(booking.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

