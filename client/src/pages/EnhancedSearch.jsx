import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFilter, FaTimes, FaSearch, FaSlidersH } from 'react-icons/fa';
import ListingItem from '../components/ListingItem';
import { SkeletonLoader, EmptyState } from '../components/SkeletonLoader';
import { useToast } from '../contexts/ToastContext';

/**
 * Enhanced Search Page with Advanced Filters
 * Supports Sell, Rent, and Night-Stay listings with dynamic filters
 */
export default function EnhancedSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success } = useToast();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all', // Matches backend 'type' parameter
    parking: false,
    furnished: false,
    offer: false,
    // Night-Stay specific filters
    bbqAvailable: false,
    campfireAvailable: false,
    soundSystemAvailable: false,
    maxGuests: '',
    category: [], // ['student', 'couple', 'family']
    minPrice: '',
    maxPrice: '',
    availableDate: '',
    sort: 'createdAt',
    order: 'desc',
  });

  // Load filters from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newFilters = {
      searchTerm: urlParams.get('searchTerm') || '',
      type: urlParams.get('type') || 'all',
      parking: urlParams.get('parking') === 'true',
      furnished: urlParams.get('furnished') === 'true',
      offer: urlParams.get('offer') === 'true',
      bbqAvailable: urlParams.get('bbqAvailable') === 'true',
      campfireAvailable: urlParams.get('campfireAvailable') === 'true',
      soundSystemAvailable: urlParams.get('soundSystemAvailable') === 'true',
      maxGuests: urlParams.get('maxGuests') || '',
      category: urlParams.get('category') ? urlParams.get('category').split(',') : [],
      minPrice: urlParams.get('minPrice') || '',
      maxPrice: urlParams.get('maxPrice') || '',
      availableDate: urlParams.get('availableDate') || '',
      sort: urlParams.get('sort') || 'createdAt',
    };

    setFilters(newFilters);
  }, [location.search]); // Sync state with URL when it changes (back/forward or manual nav)

  // Fetch listings when URL changes
  useEffect(() => {
    if (location.search) {
      fetchListings();
    }
  }, [location.search]);

  const fetchListings = async () => {
    setLoading(true);
    setShowMore(false);

    try {
      const urlParams = new URLSearchParams(location.search);
      const queryParams = new URLSearchParams();

      // Copy all URL params to query params
      urlParams.forEach((value, key) => {
        queryParams.set(key, value);
      });

      queryParams.set('limit', '12');

      const searchQuery = queryParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();

      // Client-side filtering for Night-Stay specific filters (since backend may not support all)
      let filteredData = data;

      if (urlParams.get('type') === 'night-stay') {
        filteredData = data.filter((listing) => {
          // Filter by Night-Stay sub-type
          if (listing.type !== 'night-stay' && listing.listingSubType !== 'night-stay' && !listing.bbqEnabled) return false;

          // Filter by add-ons
          if (urlParams.get('bbqAvailable') === 'true' && !listing.bbqEnabled) return false;
          if (urlParams.get('campfireAvailable') === 'true' && !listing.campfireEnabled) return false;
          if (urlParams.get('soundSystemAvailable') === 'true' && !listing.soundSystemEnabled) return false;

          // Filter by max guests
          if (urlParams.get('maxGuests')) {
            const maxGuests = parseInt(urlParams.get('maxGuests'));
            if (listing.maxGuests && listing.maxGuests < maxGuests) return false;
          }

          // Filter by category
          if (urlParams.get('category')) {
            const categories = urlParams.get('category').split(',');
            if (listing.categories && !categories.some((cat) => listing.categories.includes(cat))) {
              return false;
            }
          }

          // Filter by price range
          const price = parseFloat(listing.regularPrice);
          if (urlParams.get('minPrice') && price < parseFloat(urlParams.get('minPrice'))) return false;
          if (urlParams.get('maxPrice') && price > parseFloat(urlParams.get('maxPrice'))) return false;

          return true;
        });
      }

      if (filteredData.length >= 12) {
        setShowMore(true);
      }
      setListings(filteredData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    let newFilters = { ...filters, [key]: value };

    // Clear Night-Stay specific filters if type is changed to something else
    if (key === 'type' && value !== 'night-stay') {
      newFilters = {
        ...newFilters,
        bbqAvailable: false,
        campfireAvailable: false,
        soundSystemAvailable: false,
        maxGuests: '',
        category: [],
        availableDate: '',
      };
    }

    setFilters(newFilters);
  };

  const handleCategoryToggle = (category) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter((c) => c !== category)
      : [...filters.category, category];
    handleFilterChange('category', newCategories);
  };

  const applyFilters = () => {
    const urlParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      // Skip irrelevant filters based on type
      if (filters.type !== 'night-stay' && [
        'bbqAvailable', 'campfireAvailable', 'soundSystemAvailable',
        'maxGuests', 'category', 'availableDate'
      ].includes(key)) {
        return;
      }

      if (value && value !== '' && value !== false) {
        if (Array.isArray(value)) {
          if (value.length > 0) urlParams.set(key, value.join(','));
        } else {
          urlParams.set(key, value);
        }
      }
    });

    navigate(`/search?${urlParams.toString()}`);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      listingType: 'all',
      parking: false,
      furnished: false,
      offer: false,
      bbqAvailable: false,
      campfireAvailable: false,
      soundSystemAvailable: false,
      maxGuests: '',
      category: [],
      minPrice: '',
      maxPrice: '',
      availableDate: '',
      sort: 'createdAt',
      order: 'desc',
    };
    setFilters(clearedFilters);
    navigate('/search');
    success('Filters cleared');
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', numberOfListings);
    urlParams.set('limit', '12');

    const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
    const data = await res.json();

    if (data.length < 12) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto' : ''} p-6 border-b-2 md:border-r-2 md:min-h-screen bg-white dark:bg-slate-900 dark:border-slate-700`}>
      {isMobile && (
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-purple-800 dark:text-purple-400">Filters</h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Search Term */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
            Search Term
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="Search properties..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400"
          />
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Listing Type
          </label>
          <div className="space-y-2">
            {['all', 'sell', 'rent', 'night-stay'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={filters.type === type}
                  onChange={() => handleFilterChange('type', type)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="capitalize dark:text-slate-300">{type === 'all' ? 'All Types' : type === 'night-stay' ? 'Night-Stay' : type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Amenities */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Amenities
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.parking}
                onChange={(e) => handleFilterChange('parking', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className='dark:text-slate-300'>Parking</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.furnished}
                onChange={(e) => handleFilterChange('furnished', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className='dark:text-slate-300'>Furnished</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.offer}
                onChange={(e) => handleFilterChange('offer', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className='dark:text-slate-300'>Special Offer</span>
            </label>
          </div>
        </div>

        {/* Night-Stay Specific Filters */}
        {filters.type === 'night-stay' && (
          <div className="space-y-4 pt-4 border-t border-purple-200 dark:border-slate-700">
            <h3 className="font-semibold text-purple-800 dark:text-purple-400">Night-Stay Filters</h3>

            {/* Add-ons */}
            <div>
              <label className="block text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">
                Available Add-ons
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bbqAvailable}
                    onChange={(e) => handleFilterChange('bbqAvailable', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className='dark:text-slate-300'>BBQ Service</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.campfireAvailable}
                    onChange={(e) => handleFilterChange('campfireAvailable', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className='dark:text-slate-300'>Campfire</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.soundSystemAvailable}
                    onChange={(e) => handleFilterChange('soundSystemAvailable', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className='dark:text-slate-300'>Sound System</span>
                </label>
              </div>
            </div>

            {/* Max Guests */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Maximum Guests
              </label>
              <input
                type="number"
                min="1"
                value={filters.maxGuests}
                onChange={(e) => handleFilterChange('maxGuests', e.target.value)}
                placeholder="Any"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Suitable For
              </label>
              <div className="flex flex-wrap gap-2">
                {['student', 'couple', 'family'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-1 rounded-lg border-2 transition-all capitalize text-sm ${filters.category.includes(cat)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-slate-600 hover:border-purple-500'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Min Price (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Max Price (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Available Date */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Available Date
              </label>
              <input
                type="date"
                value={filters.availableDate}
                onChange={(e) => handleFilterChange('availableDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sort}_${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('_');
              handleFilterChange('sort', sort);
              handleFilterChange('order', order);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="createdAt_desc">Latest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="regularPrice_asc">Price: Low to High</option>
            <option value="regularPrice_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-purple-200 dark:border-slate-700">
          <button
            onClick={applyFilters}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <FilterSidebar />
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="md:hidden">
          <FilterSidebar isMobile={true} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header with Mobile Filter Button */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 z-10 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-400">
            Search Results {listings.length > 0 && `(${listings.length})`}
          </h1>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
            aria-label="Open filters"
          >
            <FaFilter />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 md:p-7">
          {loading ? (
            <div className="flex flex-wrap gap-4">
              <SkeletonLoader type="card" count={6} />
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              title="No listings found"
              message="Try adjusting your filters or search terms to find more properties"
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-4">
                {listings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>

              {showMore && (
                <button
                  onClick={onShowMoreClick}
                  className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Show More
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Filter Button (Mobile) */}
      {!showMobileFilters && (
        <button
          onClick={() => setShowMobileFilters(true)}
          className="fixed bottom-6 right-6 md:hidden bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all z-40 animate-bounce"
          aria-label="Open filters"
        >
          <FaSlidersH className="text-2xl" />
        </button>
      )}
    </div>
  );
}

