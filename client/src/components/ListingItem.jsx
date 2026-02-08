import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaMapMarkerAlt } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <div className='bg-white shadow-md hover:shadow-xl transition-all overflow-hidden rounded-2xl w-full sm:w-[330px] border border-slate-100 hover:border-emerald-200'>
      <Link to={`/listing/${listing._id}`}>
        <img
          src={listing.imageUrls?.[0] || ''}
          alt={listing.name}
          className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'
        />
        <div className='p-3 flex flex-col gap-2 w-full'>
          <p className='truncate text-lg font-semibold text-slate-700'>
            {listing.name}
          </p>
          <div className='flex items-center gap-1'>
            <FaMapMarkerAlt className='text-emerald-500 flex-shrink-0' />
            <p className='text-sm text-gray-600 truncate w-full'>
              {listing.address}
            </p>
          </div>
          <p className='text-sm text-gray-500 line-clamp-2'>
            {listing.description}
          </p>
          <p className='text-emerald-600 mt-2 font-semibold'>
            Rs{' '}
            {listing.offer
              ? listing.discountPrice.toLocaleString('en-US')
              : listing.regularPrice.toLocaleString('en-US')}
            {listing.type === 'rent' && ' / month'}
          </p>
          <div className='text-slate-700 font-semibold text-sm flex items-center gap-4'>
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
      </Link>
    </div>
  );
}

