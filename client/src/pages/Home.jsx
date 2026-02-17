import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        // Fetch all listing types in parallel instead of sequentially
        const [offerRes, rentRes, saleRes] = await Promise.all([
          fetch('/api/listing/get?offer=true&limit=4'),
          fetch('/api/listing/get?type=rent&limit=4'),
          fetch('/api/listing/get?type=sale&limit=4'),
        ]);

        const [offerData, rentData, saleData] = await Promise.all([
          offerRes.json(),
          rentRes.json(),
          saleRes.json(),
        ]);

        setOfferListings(offerData);
        setRentListings(rentData);
        setSaleListings(saleData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  return (
    <div className='dark:bg-slate-900 transition-colors duration-300'>
      {/* top */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-purple-800 dark:text-purple-300 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-purple-600 dark:text-purple-400'>perfect</span>
          <br />
          place with ease
        </h1>
        <div className='text-purple-500 dark:text-purple-400 text-xs sm:text-sm'>
          HomeHive is the best place to find your next perfect place to
          live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-purple-800 dark:text-purple-300 font-bold hover:underline'
        >
          Let's get started...
        </Link>
      </div>

      {/* swiper */}
      {offerListings && offerListings.length > 0 && (
        <Swiper modules={[Navigation]} navigation>
          {offerListings.map((listing, index) => (
            <SwiperSlide key={listing._id}>
              <img
                src={listing.imageUrls?.[0] || ''}
                alt={listing.name}
                loading={index === 0 ? 'eager' : 'lazy'}
                className='h-[500px] w-full object-cover'
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* listing results for offer, sale and rent */}
      {loading ? (
        <div className='max-w-6xl mx-auto p-3 my-10'>
          <p className='text-center text-xl text-purple-700 dark:text-purple-400'>Loading...</p>
        </div>
      ) : (
        <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
          {offerListings && offerListings.length > 0 && (
            <div className=''>
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-purple-700 dark:text-purple-300'>Recent offers</h2>
                <Link className='text-sm text-purple-800 dark:text-purple-400 hover:underline' to={'/search?offer=true'}>
                  Show more offers
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
          {rentListings && rentListings.length > 0 && (
            <div className=''>
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-purple-700 dark:text-purple-300'>Recent places for rent</h2>
                <Link className='text-sm text-purple-800 dark:text-purple-400 hover:underline' to={'/search?type=rent'}>
                  Show more places for rent
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {rentListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
          {saleListings && saleListings.length > 0 && (
            <div className=''>
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-purple-700 dark:text-purple-300'>Recent places for sale</h2>
                <Link className='text-sm text-purple-800 dark:text-purple-400 hover:underline' to={'/search?type=sale'}>
                  Show more places for sale
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {saleListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

