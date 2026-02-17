import { FaTimes, FaCheck, FaUtensils, FaFire, FaMusic, FaClock, FaUsers, FaChild } from 'react-icons/fa';

export default function ListingDetailsModal({ listing, onClose }) {
    if (!listing) return null;

    const isNightStay = listing.listingSubType === 'night-stay';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn'>
                {/* Header */}
                <div className='sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center'>
                    <div>
                        <h2 className='text-2xl font-bold text-slate-800'>Property Details</h2>
                        <p className='text-slate-500 text-sm'>{listing.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700'
                    >
                        <FaTimes className='text-xl' />
                    </button>
                </div>

                <div className='p-6 space-y-8'>
                    {/* Main Description */}
                    <section>
                        <h3 className='text-xl font-semibold text-purple-800 mb-3 border-b-2 border-purple-100 pb-2 inline-block'>
                            Description
                        </h3>
                        <p className='text-slate-700 leading-relaxed whitespace-pre-wrap'>
                            {listing.description}
                        </p>
                    </section>

                    {/* Night Stay Specific Details */}
                    {isNightStay && (
                        <>
                            {/* Guest Rules */}
                            <section className='bg-purple-50 p-5 rounded-xl border border-purple-100'>
                                <h3 className='text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2'>
                                    <FaUsers /> Guest Rules & Info
                                </h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='bg-white p-3 rounded-lg border border-purple-100'>
                                        <span className='text-xs text-purple-600 font-bold uppercase tracking-wider block mb-1'>Max Guests</span>
                                        <span className='text-lg font-medium text-slate-800'>{listing.maxGuests || 'Not specified'} Guests</span>
                                    </div>
                                    <div className='bg-white p-3 rounded-lg border border-purple-100'>
                                        <span className='text-xs text-purple-600 font-bold uppercase tracking-wider block mb-1'>Ideal For</span>
                                        <div className='flex gap-2 flex-wrap'>
                                            {listing.categories && listing.categories.length > 0 ? (
                                                listing.categories.map((cat, index) => (
                                                    <span key={index} className='bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm'>
                                                        {cat}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className='text-slate-500'>All Guests</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='bg-white p-3 rounded-lg border border-purple-100'>
                                        <span className='text-xs text-purple-600 font-bold uppercase tracking-wider block mb-1'>Check-in</span>
                                        <div className='flex items-center gap-2 text-slate-800'>
                                            <FaClock className='text-purple-400' />
                                            <span className='font-medium'>{listing.checkInTime || '14:00'}</span>
                                        </div>
                                    </div>
                                    <div className='bg-white p-3 rounded-lg border border-purple-100'>
                                        <span className='text-xs text-purple-600 font-bold uppercase tracking-wider block mb-1'>Check-out</span>
                                        <div className='flex items-center gap-2 text-slate-800'>
                                            <FaClock className='text-purple-400' />
                                            <span className='font-medium'>{listing.checkOutTime || '12:00'}</span>
                                        </div>
                                    </div>
                                </div>
                                {listing.houseRules && (
                                    <div className='mt-4 bg-white p-4 rounded-lg border border-purple-100'>
                                        <span className='text-xs text-purple-600 font-bold uppercase tracking-wider block mb-1'>House Rules</span>
                                        <p className='text-slate-700 italic border-l-4 border-purple-300 pl-3 py-1'>
                                            "{listing.houseRules}"
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Extras: BBQ, Fire, Music */}
                            <section>
                                <h3 className='text-xl font-semibold text-purple-800 mb-4 border-b-2 border-purple-100 pb-2 inline-block'>
                                    Extras & Services
                                </h3>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                    {/* BBQ */}
                                    <div className='bg-orange-50 p-4 rounded-xl border border-orange-100'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <FaUtensils className='text-orange-500 text-xl' />
                                            <h4 className='font-semibold text-orange-900'>BBQ Service</h4>
                                        </div>
                                        {listing.bbqEnabled ? (
                                            <div className='space-y-2 text-sm'>
                                                {listing.bbqAvailability?.isChickenAllowed && (
                                                    <div className='flex justify-between items-center bg-white p-2 rounded shadow-sm'>
                                                        <span>Chicken</span>
                                                        <span className='font-bold text-orange-600'>Rs {listing.bbqRates?.chicken || 700}/kg</span>
                                                    </div>
                                                )}
                                                {listing.bbqAvailability?.isMuttonAllowed && (
                                                    <div className='flex justify-between items-center bg-white p-2 rounded shadow-sm'>
                                                        <span>Mutton</span>
                                                        <span className='font-bold text-orange-600'>Rs {listing.bbqRates?.mutton || 2000}/kg</span>
                                                    </div>
                                                )}
                                                {listing.bbqAvailability?.isFishAllowed && (
                                                    <div className='flex justify-between items-center bg-white p-2 rounded shadow-sm'>
                                                        <span>Fish</span>
                                                        <span className='font-bold text-orange-600'>Rs {listing.bbqRates?.fish || 1500}/kg</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className='text-slate-500 italic text-sm'>Not available</p>
                                        )}
                                    </div>

                                    {/* Campfire */}
                                    <div className='bg-red-50 p-4 rounded-xl border border-red-100'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <FaFire className='text-red-500 text-xl' />
                                            <h4 className='font-semibold text-red-900'>Campfire</h4>
                                        </div>
                                        {listing.campfireEnabled ? (
                                            <div className='bg-white p-2 rounded shadow-sm text-center'>
                                                <span className='font-bold text-red-600 text-lg'>Rs {listing.campfirePrice || 0}</span>
                                                <span className='text-xs text-slate-500 block uppercase'>Per Session</span>
                                            </div>
                                        ) : (
                                            <p className='text-slate-500 italic text-sm'>Not available</p>
                                        )}
                                    </div>

                                    {/* Music */}
                                    <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <FaMusic className='text-blue-500 text-xl' />
                                            <h4 className='font-semibold text-blue-900'>Sound System</h4>
                                        </div>
                                        {listing.soundSystemEnabled ? (
                                            <div className='bg-white p-2 rounded shadow-sm text-center'>
                                                <span className='font-bold text-blue-600 text-lg'>Rs {listing.soundSystemPrice || 0}</span>
                                                <span className='text-xs text-slate-500 block uppercase'>Per Stay</span>
                                            </div>
                                        ) : (
                                            <p className='text-slate-500 italic text-sm'>Not available</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* Regular Amenities Grid */}
                    <section>
                        <h3 className='text-xl font-semibold text-purple-800 mb-4 border-b-2 border-purple-100 pb-2 inline-block'>
                            Amenities & Features
                        </h3>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                            <div className={`p-3 rounded-lg border ${listing.parking ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <span className='font-medium'>{listing.parking ? '✔ Parking Available' : '✘ No Parking'}</span>
                            </div>
                            <div className={`p-3 rounded-lg border ${listing.furnished ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <span className='font-medium'>{listing.furnished ? '✔ Furnished' : '✘ Unfurnished'}</span>
                            </div>
                            {/* Add generic amenities markers if available in listing data */}
                        </div>
                    </section>
                </div>

                <div className='p-4 border-t bg-slate-50 flex justify-end'>
                    <button
                        onClick={onClose}
                        className='bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors font-medium'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
