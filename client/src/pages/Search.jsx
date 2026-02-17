import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'createdAt',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    // Update sidebar data from URL params if they exist, otherwise use defaults
    setSidebardata({
      searchTerm: searchTermFromUrl || '',
      type: typeFromUrl || 'all',
      parking: parkingFromUrl === 'true',
      furnished: furnishedFromUrl === 'true',
      offer: offerFromUrl === 'true',
      sort: sortFromUrl || 'createdAt',
      order: orderFromUrl || 'desc',
    });

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);

      // Build query params with default values if not in URL
      const queryParams = new URLSearchParams();
      if (searchTermFromUrl) queryParams.set('searchTerm', searchTermFromUrl);
      if (typeFromUrl && typeFromUrl !== 'all') queryParams.set('type', typeFromUrl);
      if (parkingFromUrl === 'true') queryParams.set('parking', 'true');
      if (furnishedFromUrl === 'true') queryParams.set('furnished', 'true');
      if (offerFromUrl === 'true') queryParams.set('offer', 'true');
      queryParams.set('sort', sortFromUrl || 'createdAt');
      queryParams.set('order', orderFromUrl || 'desc');
      queryParams.set('limit', '11'); // Set limit to 11

      const searchQuery = queryParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();

      // Show "Show more" button if we got 11 listings (indicating there might be more)
      if (data.length >= 11) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'createdAt';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleTypeChange = (type) => {
    setSidebardata({ ...sidebardata, type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;

    // Build query params
    const queryParams = new URLSearchParams();
    const urlParams = new URLSearchParams(location.search);

    if (urlParams.get('searchTerm')) queryParams.set('searchTerm', urlParams.get('searchTerm'));
    if (urlParams.get('type') && urlParams.get('type') !== 'all') queryParams.set('type', urlParams.get('type'));
    if (urlParams.get('parking') === 'true') queryParams.set('parking', 'true');
    if (urlParams.get('furnished') === 'true') queryParams.set('furnished', 'true');
    if (urlParams.get('offer') === 'true') queryParams.set('offer', 'true');
    queryParams.set('sort', urlParams.get('sort') || 'createdAt');
    queryParams.set('order', urlParams.get('order') || 'desc');
    queryParams.set('startIndex', startIndex);
    queryParams.set('limit', '11');

    const searchQuery = queryParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();

    // Hide "Show more" button if we got less than 11 listings (no more to load)
    if (data.length < 11) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  // Count active filters for badge
  const activeFilterCount = [
    sidebardata.type !== 'all',
    sidebardata.parking,
    sidebardata.furnished,
    sidebardata.offer,
  ].filter(Boolean).length;

  const typeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'sale', label: 'Sell' },
    { id: 'rent', label: 'Rent' },
    { id: 'night-stay', label: 'Night Stay' },
  ];

  return (
    <div className='flex flex-col md:flex-row dark:bg-slate-900 transition-colors duration-300 min-h-screen'>
      {/* Sidebar */}
      <div className='p-6 border-b-2 md:border-r-2 md:min-h-screen dark:border-slate-700 md:w-80 lg:w-96 bg-white dark:bg-slate-800/50'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          {/* Search Term */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider'>
              Search
            </label>
            <div className='relative'>
              <input
                type='text'
                id='searchTerm'
                placeholder='Search properties...'
                className='border dark:border-slate-600 rounded-xl p-3 pl-10 w-full bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 transition-all'
                value={sidebardata.searchTerm}
                onChange={handleChange}
              />
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 dark:text-purple-500' />
            </div>
          </div>

          {/* Listing Type - Radio Pills */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider'>
              Listing Type
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {typeOptions.map((option) => (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => handleTypeChange(option.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${sidebardata.type === option.id
                      ? 'bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500 shadow-md shadow-purple-200 dark:shadow-purple-900/30'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities - Checkboxes */}
          <div className='flex flex-col gap-3'>
            <label className='text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider'>
              Prioritize By
            </label>
            <p className='text-xs text-slate-400 dark:text-slate-500 -mt-1'>
              Matching properties will appear first
            </p>
            <div className='flex flex-col gap-2'>
              <label
                htmlFor='parking'
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${sidebardata.parking
                    ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-purple-200 dark:hover:border-slate-500'
                  }`}
              >
                <input
                  type='checkbox'
                  id='parking'
                  className='w-4 h-4 accent-purple-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.parking}
                />
                <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>🅿️ Parking</span>
              </label>
              <label
                htmlFor='furnished'
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${sidebardata.furnished
                    ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-purple-200 dark:hover:border-slate-500'
                  }`}
              >
                <input
                  type='checkbox'
                  id='furnished'
                  className='w-4 h-4 accent-purple-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.furnished}
                />
                <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>🛋️ Furnished</span>
              </label>
              <label
                htmlFor='offer'
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${sidebardata.offer
                    ? 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-purple-200 dark:hover:border-slate-500'
                  }`}
              >
                <input
                  type='checkbox'
                  id='offer'
                  className='w-4 h-4 accent-purple-600 rounded'
                  onChange={handleChange}
                  checked={sidebardata.offer}
                />
                <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>🏷️ Special Offer</span>
              </label>
            </div>
          </div>

          {/* Sort */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider'>
              Sort By
            </label>
            <select
              onChange={handleChange}
              value={`${sidebardata.sort}_${sidebardata.order}`}
              id='sort_order'
              className='border dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 transition-all'
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to high</option>
              <option value='createdAt_desc'>Latest</option>
              <option value='createdAt_asc'>Oldest</option>
            </select>
          </div>

          {/* Search Button */}
          <button className='relative bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl font-semibold uppercase tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 shadow-md shadow-purple-200 dark:shadow-purple-900/30'>
            <FaFilter className='text-sm' />
            Apply Filters
            {activeFilterCount > 0 && (
              <span className='absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>
      </div>
      <div className='flex-1'>
        <h1 className='text-3xl font-semibold border-b dark:border-slate-700 p-3 text-slate-700 dark:text-slate-200 mt-5'>
          Listing results:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-700 dark:text-slate-400'>No listing found!</p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 dark:text-slate-400 text-center w-full'>
              Loading...
            </p>
          )}

          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && !loading && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 dark:text-green-400 hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

