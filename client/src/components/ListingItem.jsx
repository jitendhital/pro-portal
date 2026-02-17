import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <div className='bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden rounded-2xl w-full sm:w-[330px] border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-600'>
      <Link to={`/listing/${listing._id}`}>
        <div className='relative overflow-hidden'>
          <img
            src={listing.imageUrls?.[0] || ''}
            alt={listing.name}
            loading='lazy'
            className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'
          />
          <div className='absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-md z-10 dark:text-slate-200'>
            {listing.listingSubType === 'night-stay' ? 'Stay' : (listing.type === 'rent' ? 'Rent' : 'Sale')}
          </div>
        </div>
        <div className='p-3 flex flex-col gap-2 w-full'>
          <p className='truncate text-lg font-semibold text-slate-700 dark:text-slate-200'>
            {listing.name}
          </p>
          <div className='flex items-center gap-1'>
            <FaMapMarkerAlt className='text-emerald-500 flex-shrink-0' />
            <p className='text-sm text-gray-600 dark:text-gray-400 truncate w-full'>
              {listing.address}
            </p>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>
            {listing.description}
          </p>
          <p className='text-emerald-600 dark:text-emerald-400 mt-2 font-semibold'>
            Rs{' '}
            {listing.offer
              ? listing.discountPrice.toLocaleString('en-US')
              : listing.regularPrice.toLocaleString('en-US')}
            {listing.listingSubType === 'night-stay' ? ' / night' : (listing.type === 'rent' && ' / month')}
          </p>
          <div className='text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <FaBed className='text-lg' />
              <span>{listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}</span>
            </div>
            <div className='flex items-center gap-1'>
              <FaBath className='text-lg' />
              <span>{listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}</span>
            </div>
          </div>
        </div>
      </Link >
    </div >
  );
}
