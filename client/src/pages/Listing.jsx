import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaCalendarAlt,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import BookVisit from '../components/BookVisit';
import NightStayBookingModal from '../components/NightStayBookingModal';
import PropertyBookingModal from '../components/PropertyBookingModal';
import { SkeletonLoader } from '../components/SkeletonLoader';
import ShareButton from '../components/ShareButton';
import { useFavorites } from '../hooks/useFavorites';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import SimilarProperties from '../components/SimilarProperties';
import ListingDetailsModal from '../components/ListingDetailsModal';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [showBookVisit, setShowBookVisit] = useState(false);
  const [showNightStayBooking, setShowNightStayBooking] = useState(false);
  const [showPropertyBooking, setShowPropertyBooking] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }

        setListing(data.listing);
        setLoading(false);
        setError(false);

        // Fetch unavailable dates for night-stay listings and all rentals
        if (data.listing.listingSubType === 'night-stay' || data.listing.type === 'rent') {
          fetchUnavailableDates(data.listing._id);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    const fetchUnavailableDates = async (listingId) => {
      try {
        // Fetch bookings for this property (as seller)
        const res = await fetch(`/api/booking/get?type=seller`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.bookings) {
          // Filter bookings for this property and extract dates
          const dates = data.bookings
            .filter((b) => b.propertyId === listingId || b.propertyId?._id === listingId)
            .filter((b) => b.status === 'approved' || b.status === 'pending')
            .map((b) => {
              const date = b.date;
              return typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0];
            });
          setUnavailableDates([...new Set(dates)]); // Remove duplicates
        }
      } catch (error) {
        console.error('Error fetching unavailable dates:', error);
      }
    };

    fetchListing();

    // Fetch all listings for similar properties recommendation
    const fetchAllListings = async () => {
      try {
        const res = await fetch('/api/listing/get?limit=100');
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setAllListings(data);
        }
      } catch (error) {
        console.error('Error fetching all listings:', error);
      }
    };

    fetchAllListings();
  }, [params.listingId]);

  return (
    <main className='w-full dark:bg-slate-900 transition-colors duration-300'>
      {loading && (
        <div className='max-w-4xl mx-auto p-3 my-7'>
          <SkeletonLoader type="listing-detail" />
        </div>
      )}
      {error && (
        <div className='text-center my-7'>
          <p className='text-2xl text-red-600 mb-4'>Something went wrong!</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700'
          >
            Reload Page
          </button>
        </div>
      )}
      {listing && !loading && !error && (
        <div className='w-full'>
          <Swiper
            modules={[Navigation]}
            navigation
            className='w-full'
            style={{ width: '100%', height: '550px' }}
          >
            {listing.imageUrls && listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='w-full h-full'
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                    width: '100%',
                    height: '100%',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Action Buttons - Share and Favorite */}
          <div className='fixed top-[13%] right-[3%] z-10 flex flex-col gap-3'>
            <button
              onClick={() => toggleFavorite(listing._id)}
              className='border rounded-full w-12 h-12 flex justify-center items-center bg-white dark:bg-slate-800 shadow-lg hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors cursor-pointer'
              aria-label={isFavorite(listing._id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(listing._id) ? (
                <FaHeart className='text-red-500 text-xl' />
              ) : (
                <FaRegHeart className='text-purple-600 text-xl' />
              )}
            </button>
            <div className='border rounded-full w-12 h-12 flex justify-center items-center bg-white dark:bg-slate-800 shadow-lg hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors cursor-pointer'>
              <ShareButton listingId={listing._id} listingName={listing.name} />
            </div>
          </div>
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <p className='text-2xl font-semibold dark:text-slate-100'>
              {listing.name} - Rs{' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.listingSubType === 'night-stay' ? ' / night' : (listing.type === 'rent' && ' / month')}
            </p>
            <p className='flex items-center mt-6 gap-2 text-slate-600 dark:text-slate-400 text-sm'>
              <FaMapMarkerAlt className='text-green-700' />
              {listing.address}
            </p>
            <div className='flex gap-4 flex-wrap'>
              <p className={`w-full max-w-[200px] text-white text-center p-1 rounded-md ${listing.listingSubType === 'night-stay'
                ? 'bg-purple-600'
                : listing.type === 'rent'
                  ? 'bg-red-900'
                  : 'bg-blue-900'
                }`}>
                {listing.listingSubType === 'night-stay'
                  ? 'Stay'
                  : listing.type === 'rent'
                    ? 'Rent'
                    : 'Sale'}
              </p>
              {listing.offer && (
                <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                  Rs {(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} OFF
                </p>
              )}
            </div>
            <p className='text-slate-800 dark:text-slate-300'>
              <span className='font-semibold text-black dark:text-slate-100'>Description - </span>
              {listing.description}
            </p>
            <ul className='text-green-900 dark:text-green-400 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6'>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaBed className='text-lg' />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaBath className='text-lg' />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaParking className='text-lg' />
                {listing.parking ? 'Parking spot' : 'No Parking'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap '>
                <FaChair className='text-lg' />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <button
                  onClick={() => setShowDetailsModal(true)}
                  className='text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 underline font-bold cursor-pointer transition-colors'
                >
                  View Details
                </button>
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && !showBookVisit && !showNightStayBooking && !showPropertyBooking && (
              <div className='flex gap-3 flex-wrap'>
                {/* Night-Stay Listing: Show Book One-Night Stay */}
                {listing.listingSubType === 'night-stay' ? (
                  <>
                    <button
                      onClick={() => setShowNightStayBooking(true)}
                      className='bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 min-w-[200px] font-semibold shadow-lg hover:shadow-xl transition-all'
                    >
                      🌙 Book One-Night Stay
                    </button>
                    <button
                      onClick={() => setContact(true)}
                      className='bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 min-w-[200px] font-semibold shadow-lg hover:shadow-xl transition-all'
                    >
                      Contact landlord
                    </button>
                  </>
                ) : listing.type === 'rent' ? (
                  /* Normal Rent Listing: Show Book Visit Time and Book Property */
                  <>
                    <button
                      onClick={() => setShowBookVisit(true)}
                      className='bg-purple-600 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold'
                    >
                      📅 Book Visit Time
                    </button>
                    <button
                      onClick={() => setShowPropertyBooking(true)}
                      className='bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold shadow-md'
                    >
                      🏠 Book Property
                    </button>
                    <button
                      onClick={() => setContact(true)}
                      className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold'
                    >
                      Contact landlord
                    </button>
                  </>
                ) : (
                  /* Sale Listing: Show Book a Visit and Book Property */
                  <>
                    <button
                      onClick={() => setShowBookVisit(true)}
                      className='bg-purple-600 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold'
                    >
                      📅 Book a Visit
                    </button>
                    <button
                      onClick={() => setShowPropertyBooking(true)}
                      className='bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold shadow-md'
                    >
                      🏠 Book Property
                    </button>
                    <button
                      onClick={() => setContact(true)}
                      className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 font-semibold'
                    >
                      Contact landlord
                    </button>
                  </>
                )}
              </div>
            )}
            {showBookVisit && <BookVisit listing={listing} onClose={() => setShowBookVisit(false)} />}
            {showNightStayBooking && (
              <NightStayBookingModal
                listing={listing}
                onClose={() => setShowNightStayBooking(false)}
                unavailableDates={unavailableDates}
              />
            )}
            {showPropertyBooking && (
              <PropertyBookingModal
                listing={listing}
                onClose={() => setShowPropertyBooking(false)}
              />
            )}
            {showDetailsModal && (
              <ListingDetailsModal
                listing={listing}
                onClose={() => setShowDetailsModal(false)}
              />
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}

      {/* Similar Properties Section - Uses Recommendation Algorithm */}
      {listing && allListings.length > 0 && (
        <div className="max-w-6xl mx-auto p-3">
          <SimilarProperties currentListing={listing} allListings={allListings} />
        </div>
      )}
    </main>
  );
}

