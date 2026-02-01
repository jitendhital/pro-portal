import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaHome, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa';

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('seller'); // 'seller' or 'buyer'
  const [sellerBookings, setSellerBookings] = useState([]);
  const [buyerBookings, setBuyerBookings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState({ seller: false, buyer: false, listings: false });
  const [error, setError] = useState({ seller: '', buyer: '', listings: '' });

  const updateLoading = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const updateError = (key, value) => {
    setError(prev => ({ ...prev, [key]: value }));
  };
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/signIn');
      return;
    }
    fetchSellerBookings();
    fetchBuyerBookings();
    fetchUserListings();
  }, [currentUser]);

  const fetchSellerBookings = async () => {
    try {
      updateLoading('seller', true);
      updateError('seller', '');
      const res = await fetch('/api/booking/get?type=seller', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        updateError('seller', data.message || 'Failed to fetch bookings');
        updateLoading('seller', false);
        return;
      }

      setSellerBookings(data.bookings || []);
    } catch (error) {
      updateError('seller', 'An error occurred. Please try again.');
      console.error('Error fetching seller bookings:', error);
    } finally {
      updateLoading('seller', false);
    }
  };

  const fetchBuyerBookings = async () => {
    try {
      updateLoading('buyer', true);
      updateError('buyer', '');
      const res = await fetch('/api/booking/get?type=buyer', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        updateError('buyer', data.message || 'Failed to fetch bookings');
        updateLoading('buyer', false);
        return;
      }

      setBuyerBookings(data.bookings || []);
    } catch (error) {
      updateError('buyer', 'An error occurred. Please try again.');
      console.error('Error fetching buyer bookings:', error);
    } finally {
      updateLoading('buyer', false);
    }
  };

  const fetchUserListings = async () => {
    try {
      updateLoading('listings', true);
      updateError('listings', '');
      const res = await fetch(`/api/listing/user/${currentUser._id}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success === false) {
        updateError('listings', data.message);
        return;
      }

      setUserListings(data.listings);
    } catch (error) {
      updateError('listings', error.message);
    } finally {
      updateLoading('listings', false);
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success === false) {
        alert(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('An error occurred while deleting the listing');
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setUpdating({ ...updating, [bookingId]: true });
      const res = await fetch(`/api/booking/update/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        alert(data.message || 'Failed to update booking status');
        return;
      }

      // Update the booking in the seller list
      setSellerBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error('Error updating booking:', error);
    } finally {
      setUpdating({ ...updating, [bookingId]: false });
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

  const getStats = (bookings) => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      approved: bookings.filter((b) => b.status === 'approved').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
    };
  };

  const sellerStats = getStats(sellerBookings);
  const buyerStats = getStats(buyerBookings);
  const listingStats = {
    total: userListings.length,
    rent: userListings.filter(l => l.type === 'rent').length,
    sale: userListings.filter(l => l.type === 'sale').length
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-slate-800 mb-2'>Dashboard</h1>
          <p className='text-slate-600'>Manage your property visit bookings</p>
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-4 mb-6 border-b border-slate-200'>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'seller'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <span className='flex items-center gap-2'>
              <FaHome className='text-lg' />
              Visit Requests (Seller)
            </span>
            {sellerStats.pending > 0 && (
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {sellerStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'buyer'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <span className='flex items-center gap-2'>
              <FaCalendarAlt className='text-lg' />
              My Bookings (Buyer)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'listings'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
              }`}
          >
            <span className='flex items-center gap-2'>
              <FaBuilding className='text-lg' />
              My Listings
            </span>
            <span className='absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {userListings.length}
            </span>
          </button>
        </div>

        {/* Seller Tab Content */}
        {activeTab === 'seller' && (
          <div>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Total Requests</p>
                    <p className='text-3xl font-bold text-slate-800'>{sellerStats.total}</p>
                  </div>
                  <FaHome className='text-3xl text-purple-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Pending</p>
                    <p className='text-3xl font-bold text-yellow-600'>{sellerStats.pending}</p>
                  </div>
                  <FaHourglassHalf className='text-3xl text-yellow-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Approved</p>
                    <p className='text-3xl font-bold text-green-600'>{sellerStats.approved}</p>
                  </div>
                  <FaCheckCircle className='text-3xl text-green-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Rejected</p>
                    <p className='text-3xl font-bold text-red-600'>{sellerStats.rejected}</p>
                  </div>
                  <FaTimesCircle className='text-3xl text-red-500' />
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className='flex justify-end mb-4'>
              <button
                onClick={fetchSellerBookings}
                className='bg-purple-600 text-white rounded-lg px-4 py-2 hover:opacity-95 transition-opacity flex items-center gap-2'
              >
                <span>Refresh</span>
              </button>
            </div>

            {/* Error Message */}
            {error.seller && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                {error.seller}
              </div>
            )}

            {/* Loading State */}
            {loading.seller && (
              <div className='text-center py-12'>
                <p className='text-slate-600'>Loading bookings...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading.seller && sellerBookings.length === 0 && (
              <div className='bg-white rounded-lg shadow-md p-12 text-center'>
                <FaHome className='text-6xl text-slate-300 mx-auto mb-4' />
                <p className='text-slate-600 text-lg font-medium mb-2'>No visit requests yet</p>
                <p className='text-slate-500'>
                  When buyers request to visit your properties, they will appear here.
                </p>
              </div>
            )}

            {/* Bookings List */}
            {!loading.seller && sellerBookings.length > 0 && (
              <div className='flex flex-col gap-4'>
                {sellerBookings.map((booking) => {
                  const property = booking.propertyId || {};
                  const buyer = booking.buyerId || {};

                  return (
                    <div
                      key={booking._id}
                      className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
                    >
                      <div className='flex flex-col md:flex-row gap-4'>
                        {/* Property Image */}
                        {property.imageUrls && property.imageUrls[0] && (
                          <div className='md:w-48 flex-shrink-0'>
                            <img
                              src={property.imageUrls[0]}
                              alt={property.name}
                              className='w-full h-32 object-cover rounded-lg'
                            />
                          </div>
                        )}

                        {/* Booking Details */}
                        <div className='flex-1 flex flex-col gap-3'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <h3 className='text-xl font-semibold text-slate-800'>
                                {property.name || 'Property'}
                              </h3>
                              <p className='text-sm text-slate-600 flex items-center gap-1 mt-1'>
                                <FaMapMarkerAlt className='text-green-700' />
                                {property.address || 'Address not available'}
                              </p>
                            </div>
                            <BookingStatusBadge status={booking.status} />
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                            <div className='flex items-center gap-2 text-slate-700'>
                              <FaUser className='text-slate-500' />
                              <span>
                                <strong>Buyer:</strong> {buyer.username || buyer.email || 'Unknown'}
                              </span>
                            </div>
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
                                <strong>Message:</strong> {booking.message}
                              </p>
                            </div>
                          )}

                          {booking.status === 'pending' && (
                            <div className='flex gap-3 pt-2'>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                disabled={updating[booking._id]}
                                className='flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2'
                              >
                                <FaCheckCircle />
                                {updating[booking._id] ? 'Updating...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                disabled={updating[booking._id]}
                                className='flex-1 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2'
                              >
                                <FaTimesCircle />
                                {updating[booking._id] ? 'Updating...' : 'Reject'}
                              </button>
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
            )}
          </div>
        )}

        {/* Buyer Tab Content */}
        {activeTab === 'buyer' && (
          <div>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Total Bookings</p>
                    <p className='text-3xl font-bold text-slate-800'>{buyerStats.total}</p>
                  </div>
                  <FaCalendarAlt className='text-3xl text-purple-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Pending</p>
                    <p className='text-3xl font-bold text-yellow-600'>{buyerStats.pending}</p>
                  </div>
                  <FaHourglassHalf className='text-3xl text-yellow-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Approved</p>
                    <p className='text-3xl font-bold text-green-600'>{buyerStats.approved}</p>
                  </div>
                  <FaCheckCircle className='text-3xl text-green-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Rejected</p>
                    <p className='text-3xl font-bold text-red-600'>{buyerStats.rejected}</p>
                  </div>
                  <FaTimesCircle className='text-3xl text-red-500' />
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className='flex justify-end mb-4'>
              <button
                onClick={fetchBuyerBookings}
                className='bg-purple-600 text-white rounded-lg px-4 py-2 hover:opacity-95 transition-opacity flex items-center gap-2'
              >
                <span>Refresh</span>
              </button>
            </div>

            {/* Error Message */}
            {error.buyer && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                {error.buyer}
              </div>
            )}

            {/* Loading State */}
            {loading.buyer && (
              <div className='text-center py-12'>
                <p className='text-slate-600'>Loading bookings...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading.buyer && buyerBookings.length === 0 && (
              <div className='bg-white rounded-lg shadow-md p-12 text-center'>
                <FaCalendarAlt className='text-6xl text-slate-300 mx-auto mb-4' />
                <p className='text-slate-600 text-lg font-medium mb-2'>
                  You haven't made any booking requests yet
                </p>
                <p className='text-slate-500 mb-4'>
                  Browse properties and book a visit to see them here.
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className='bg-purple-600 text-white rounded-lg px-6 py-2 hover:opacity-95'
                >
                  Browse Properties
                </button>
              </div>
            )}

            {/* Bookings List */}
            {!loading.buyer && buyerBookings.length > 0 && (
              <div className='flex flex-col gap-4'>
                {buyerBookings.map((booking) => {
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
                              <div
                                onClick={() => navigate(`/listing/${property._id}`)}
                                className='cursor-pointer'
                              >
                                <img
                                  src={property.imageUrls[0]}
                                  alt={property.name}
                                  className='w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity'
                                />
                              </div>
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
                                <h3
                                  onClick={() => navigate(`/listing/${property._id}`)}
                                  className='text-xl font-semibold text-slate-800 hover:text-purple-600 cursor-pointer'
                                >
                                  {property.name || 'Property'}
                                </h3>
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
            )}
          </div>
        )}

        {/* Listings Tab Content */}
        {activeTab === 'listings' && (
          <div>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>Total Listings</p>
                    <p className='text-3xl font-bold text-slate-800'>{listingStats.total}</p>
                  </div>
                  <FaBuilding className='text-3xl text-purple-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>For Rent/Stay</p>
                    <p className='text-3xl font-bold text-blue-600'>{listingStats.rent}</p>
                  </div>
                  <FaHome className='text-3xl text-blue-500' />
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-slate-600 text-sm font-medium'>For Sale</p>
                    <p className='text-3xl font-bold text-green-600'>{listingStats.sale}</p>
                  </div>
                  <FaCheckCircle className='text-3xl text-green-500' />
                </div>
              </div>
            </div>

            {/* Create Listing Button */}
            <div className='flex justify-end mb-4'>
              <button
                onClick={() => navigate('/create')}
                className='bg-purple-600 text-white rounded-lg px-6 py-2 hover:opacity-95 transition-opacity flex items-center gap-2'
              >
                <span>+ Create New Listing</span>
              </button>
              <button
                onClick={fetchUserListings}
                className='ml-3 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <span>Refresh</span>
              </button>
            </div>

            {/* Error Message */}
            {error.listings && (
              <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                {error.listings}
              </div>
            )}

            {/* Loading State */}
            {loading.listings && (
              <div className='text-center py-12'>
                <p className='text-slate-600'>Loading listings...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading.listings && userListings.length === 0 && (
              <div className='bg-white rounded-lg shadow-md p-12 text-center'>
                <FaBuilding className='text-6xl text-slate-300 mx-auto mb-4' />
                <p className='text-slate-600 text-lg font-medium mb-2'>
                  You haven't posted any listings yet
                </p>
                <p className='text-slate-500 mb-4'>
                  Create a listing to start renting or selling your property.
                </p>
                <button
                  onClick={() => navigate('/create')}
                  className='bg-purple-600 text-white rounded-lg px-6 py-2 hover:opacity-95'
                >
                  Create Listing
                </button>
              </div>
            )}

            {/* Listings List */}
            {!loading.listings && userListings.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {userListings.map((listing) => (
                  <div
                    key={listing._id}
                    className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col'
                  >
                    <div className='relative h-48'>
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.name}
                        className='w-full h-full object-cover'
                      />
                      <div className='absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold uppercase shadow-sm'>
                        {listing.type === 'rent' ? (listing.listingSubType === 'night-stay' ? 'Night Stay' : 'Rent') : 'Sale'}
                      </div>
                    </div>

                    <div className='p-4 flex-1 flex flex-col'>
                      <h3 className='text-lg font-semibold text-slate-800 mb-1 truncate'>
                        {listing.name}
                      </h3>
                      <p className='text-sm text-slate-500 flex items-center gap-1 mb-3'>
                        <FaMapMarkerAlt className='text-green-600' />
                        <span className='truncate'>{listing.address}</span>
                      </p>

                      <div className='mt-auto flex gap-2'>
                        <button
                          onClick={() => navigate(`/update-listing/${listing._id}`)}
                          className='flex-1 bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 text-sm font-semibold hover:bg-green-100 flex items-center justify-center gap-1'
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleListingDelete(listing._id)}
                          className='flex-1 bg-red-50 text-red-700 border border-red-200 rounded-lg py-2 text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-1'
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                      <button
                        onClick={() => navigate(`/listing/${listing._id}`)}
                        className='w-full mt-2 text-purple-600 text-sm font-medium hover:underline text-center'
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
