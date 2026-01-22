import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUsers, FaCalendarAlt, FaFire, FaMusic, FaDrumstickBite, FaCheckCircle } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import { useBBQCalculator } from '../hooks/useBBQCalculator';

/**
 * Night-Stay Booking Modal Component
 * Handles booking flow for night-stay listings with add-ons and price calculation
 * @param {Object} props
 * @param {Object} props.listing - The listing object
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.unavailableDates - Array of unavailable dates
 */
export default function NightStayBookingModal({ listing, onClose, unavailableDates = [] }) {
  const { currentUser } = useSelector((state) => state.user);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [bbqEnabled, setBBQEnabled] = useState(false);
  const [campfireEnabled, setCampfireEnabled] = useState(false);
  const [soundSystemEnabled, setSoundSystemEnabled] = useState(false);

  // BBQ calculator hook
  const {
    chickenKg,
    muttonKg,
    fishKg,
    setChickenKg,
    setMuttonKg,
    setFishKg,
    calculations: bbqCalculations,
    rates: bbqRates,
  } = useBBQCalculator(bbqEnabled);

  // Get min date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Check if date is unavailable
  const isDateUnavailable = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return unavailableDates.some((unavailableDate) => {
      const unavailable = new Date(unavailableDate);
      return (
        date.getDate() === unavailable.getDate() &&
        date.getMonth() === unavailable.getMonth() &&
        date.getFullYear() === unavailable.getFullYear()
      );
    });
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = parseFloat(listing.regularPrice) || 0;

    // Add BBQ price if enabled
    if (bbqEnabled) {
      total += bbqCalculations.total;
    }

    // Add campfire price if enabled
    if (campfireEnabled && listing.campfirePrice) {
      total += parseFloat(listing.campfirePrice) || 0;
    }

    // Add sound system price if enabled
    if (soundSystemEnabled && listing.soundSystemPrice) {
      total += parseFloat(listing.soundSystemPrice) || 0;
    }

    return total;
  }, [listing.regularPrice, bbqEnabled, bbqCalculations.total, campfireEnabled, listing.campfirePrice, soundSystemEnabled, listing.soundSystemPrice]);

  // Validate booking
  const validateBooking = () => {
    if (!selectedDate) {
      showError('Please select a check-in date');
      return false;
    }

    if (isDateUnavailable(selectedDate)) {
      showError('Selected date is not available');
      return false;
    }

    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateObj <= today) {
      showError('Please select a future date');
      return false;
    }

    if (numberOfGuests < 1) {
      showError('Number of guests must be at least 1');
      return false;
    }

    if (listing.maxGuests && numberOfGuests > listing.maxGuests) {
      showError(`Maximum ${listing.maxGuests} guests allowed`);
      return false;
    }

    return true;
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateBooking()) return;

    if (!currentUser) {
      showError('Please sign in to book a stay');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        propertyId: listing._id,
        date: selectedDate,
        timeSlot: listing.checkInTime || '14:00', // Use listing's check-in time
        message: `Night-Stay Booking: ${numberOfGuests} guest(s)`,
        bookingType: 'night-stay',
        numberOfGuests,
        addOns: {
          bbq: bbqEnabled
            ? {
                enabled: true,
                chickenKg,
                muttonKg,
                fishKg,
                totalPrice: bbqCalculations.total,
              }
            : { enabled: false },
          campfire: {
            enabled: campfireEnabled,
            price: campfireEnabled ? parseFloat(listing.campfirePrice || 0) : 0,
          },
          soundSystem: {
            enabled: soundSystemEnabled,
            price: soundSystemEnabled ? parseFloat(listing.soundSystemPrice || 0) : 0,
          },
        },
        totalPrice,
      };

      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingPayload),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showError(data.message || 'Failed to create booking');
        return;
      }

      setBookingData(data.booking);
      setSubmitted(true);
      success('Booking request submitted successfully!');
      
      // Navigate to booking summary after a short delay
      setTimeout(() => {
        if (data.booking._id) {
          navigate(`/booking/${data.booking._id}`);
          onClose();
        }
      }, 2000);
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (submitted && bookingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in-right">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">Booking Confirmed!</h2>
            <p className="text-purple-600 mb-6">
              Your night-stay booking request has been submitted successfully.
            </p>

            {/* Booking Summary */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-purple-800 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{numberOfGuests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-bold text-purple-600">Rs {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white rounded-lg py-3 font-semibold hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-purple-800">Book One-Night Stay</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-purple-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  value={selectedDate}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (!isDateUnavailable(date)) {
                      setSelectedDate(date);
                    } else {
                      showError('This date is not available');
                    }
                  }}
                  min={getMinDate()}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    selectedDate && isDateUnavailable(selectedDate)
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                />
                {selectedDate && isDateUnavailable(selectedDate) && (
                  <p className="text-red-500 text-sm mt-1">This date is not available</p>
                )}
              </div>

              {/* Number of Guests */}
              <div>
                <label htmlFor="numberOfGuests" className="block text-sm font-medium text-purple-700 mb-2">
                  <FaUsers className="inline mr-2" />
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="numberOfGuests"
                  min="1"
                  max={listing.maxGuests || 20}
                  value={numberOfGuests}
                  onChange={(e) => {
                    const guests = parseInt(e.target.value) || 1;
                    if (listing.maxGuests && guests > listing.maxGuests) {
                      showError(`Maximum ${listing.maxGuests} guests allowed`);
                      return;
                    }
                    setNumberOfGuests(guests);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                {listing.maxGuests && (
                  <p className="text-sm text-purple-600 mt-1">Maximum {listing.maxGuests} guests</p>
                )}
              </div>

              {/* Add-ons Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">Add-ons</h3>

                {/* BBQ Service */}
                {listing.bbqEnabled && (
                  <div className="border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FaDrumstickBite className="text-2xl text-orange-500" />
                        <div>
                          <h4 className="font-semibold text-purple-800">BBQ Service</h4>
                          <p className="text-sm text-purple-600">Custom BBQ with fresh ingredients</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bbqEnabled}
                          onChange={(e) => setBBQEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {bbqEnabled && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-purple-200">
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Chicken (Rs {bbqRates.chicken}/kg)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={chickenKg}
                              onChange={(e) => setChickenKg(parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="w-24 px-3 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold text-sm flex items-center justify-center">
                              Rs {bbqCalculations.chickenPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Mutton (Rs {bbqRates.mutton}/kg)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={muttonKg}
                              onChange={(e) => setMuttonKg(parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="w-24 px-3 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold text-sm flex items-center justify-center">
                              Rs {bbqCalculations.muttonPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Fish (Rs {bbqRates.fish}/kg)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={fishKg}
                              onChange={(e) => setFishKg(parseFloat(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="w-24 px-3 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold text-sm flex items-center justify-center">
                              Rs {bbqCalculations.fishPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-purple-200 flex justify-between items-center">
                          <span className="font-semibold text-purple-800">BBQ Total:</span>
                          <span className="text-xl font-bold text-purple-600">
                            Rs {bbqCalculations.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Campfire */}
                {listing.campfireEnabled && (
                  <div className="border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaFire className="text-2xl text-orange-500" />
                        <div>
                          <h4 className="font-semibold text-purple-800">Campfire</h4>
                          <p className="text-sm text-purple-600">
                            Evening campfire experience - Rs {parseFloat(listing.campfirePrice || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={campfireEnabled}
                          onChange={(e) => setCampfireEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Sound System */}
                {listing.soundSystemEnabled && (
                  <div className="border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaMusic className="text-2xl text-purple-500" />
                        <div>
                          <h4 className="font-semibold text-purple-800">Sound System</h4>
                          <p className="text-sm text-purple-600">
                            Music system for your stay - Rs {parseFloat(listing.soundSystemPrice || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={soundSystemEnabled}
                          onChange={(e) => setSoundSystemEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Price Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Price Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Base Price:</span>
                    <span>Rs {parseFloat(listing.regularPrice || 0).toLocaleString()}</span>
                  </div>

                  {bbqEnabled && bbqCalculations.total > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>BBQ Service:</span>
                      <span>Rs {bbqCalculations.total.toLocaleString()}</span>
                    </div>
                  )}

                  {campfireEnabled && listing.campfirePrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Campfire:</span>
                      <span>Rs {parseFloat(listing.campfirePrice || 0).toLocaleString()}</span>
                    </div>
                  )}

                  {soundSystemEnabled && listing.soundSystemPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Sound System:</span>
                      <span>Rs {parseFloat(listing.soundSystemPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-purple-400">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-3xl font-bold">Rs {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedDate}
                  className="w-full mt-6 bg-white text-purple-600 rounded-lg py-3 font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

