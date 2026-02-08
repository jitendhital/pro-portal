import { useState } from 'react';
import { useSelector } from 'react-redux';
import BookingStatusBadge from './BookingStatusBadge';

export default function BookVisit({ listing, onClose }) {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  // Available time slots
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Allow booking from tomorrow
    return today.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      setError('Please select a future date');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: listing._id,
          date: formData.date,
          timeSlot: formData.timeSlot,
          message: formData.message,
          totalPrice: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to create booking');
        setLoading(false);
        return;
      }

      setBooking(data.booking);
      setSuccess(true);
      setFormData({ date: '', timeSlot: '', message: '' });
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success && booking) {
    return (
      <div className='flex flex-col gap-4 p-4 border rounded-lg bg-green-50'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-green-800'>Booking Request Sent!</h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            ✕
          </button>
        </div>
        <p className='text-green-700'>
          Your visit request has been sent to the seller. You will be notified once they respond.
        </p>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>Status:</span>
          <BookingStatusBadge status={booking.status} />
        </div>
        <button
          onClick={onClose}
          className='bg-green-700 text-white rounded-lg p-2 hover:opacity-95'
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 p-4 border rounded-lg bg-white'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>
          {listing.type === 'rent' ? 'Book Visit Time' : 'Book a Visit'}
        </h3>
        <button
          onClick={onClose}
          className='text-gray-500 hover:text-gray-700 text-xl'
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* Date Picker */}
        <div className='flex flex-col gap-2'>
          <label htmlFor='date' className='text-sm font-medium text-gray-700'>
            📅 Select Date
          </label>
          <input
            type='date'
            id='date'
            value={formData.date}
            onChange={handleChange}
            min={getMinDate()}
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            required
          />
        </div>

        {/* Time Slot Selection */}
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium text-gray-700'>
            ⏰ Select Time Slot
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type='button'
                onClick={() => {
                  setFormData({ ...formData, timeSlot: slot });
                  setError('');
                }}
                className={`p-2 rounded-lg border text-sm transition-all ${formData.timeSlot === slot
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50'
                  }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Message */}
        <div className='flex flex-col gap-2'>
          <label htmlFor='message' className='text-sm font-medium text-gray-700'>
            Message (Optional)
          </label>
          <textarea
            id='message'
            value={formData.message}
            onChange={handleChange}
            placeholder='Add any additional information...'
            rows='3'
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>

        {error && (
          <p className='text-red-600 text-sm'>{error}</p>
        )}

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-gray-300 text-gray-700 rounded-lg p-3 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='flex-1 bg-purple-600 text-white rounded-lg p-3 hover:opacity-95 disabled:opacity-50'
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

