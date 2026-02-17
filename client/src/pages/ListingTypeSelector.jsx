import { useNavigate } from 'react-router-dom';
import { FaHome, FaKey, FaMoon } from 'react-icons/fa';

/**
 * Listing Type Selector Page
 * Displays three animated cards for Sell, Rent, and Night-Stay listing types
 */
export default function ListingTypeSelector() {
  const navigate = useNavigate();

  const listingTypes = [
    {
      id: 'sell',
      title: 'Sell Property',
      description: 'List your property for sale. Perfect for homeowners looking to sell.',
      icon: FaHome,
      route: '/create/sell',
      gradient: 'from-purple-500 to-purple-700',
      hoverGradient: 'from-purple-600 to-purple-800',
    },
    {
      id: 'rent',
      title: 'Rent Property',
      description: 'Rent out your property. Ideal for landlords and property owners.',
      icon: FaKey,
      route: '/create/rent',
      gradient: 'from-purple-400 to-purple-600',
      hoverGradient: 'from-purple-500 to-purple-700',
    },
    {
      id: 'night-stay',
      title: 'Night Stay Experience',
      description: 'Offer unique 24-hour experiences. Perfect for vacation rentals and special stays.',
      icon: FaMoon,
      route: '/create/night-stay',
      gradient: 'from-purple-600 to-purple-800',
      hoverGradient: 'from-purple-700 to-purple-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 dark:text-purple-400 mb-4">
            Create Your Listing
          </h1>
          <p className="text-lg text-purple-600 dark:text-purple-500">
            Choose the type of listing you want to create
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {listingTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => navigate(type.route)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(type.route);
                  }
                }}
                aria-label={`Create ${type.title} listing`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative p-8 flex flex-col items-center text-center h-full min-h-[300px]">
                  {/* Icon */}
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <div className={`p-6 rounded-full bg-gradient-to-br ${type.gradient} text-white shadow-lg`}>
                      <Icon className="text-4xl md:text-5xl" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-300 group-hover:text-white transition-colors duration-300 mb-3">
                    {type.title}
                  </h2>

                  {/* Description */}
                  <p className="text-purple-600 dark:text-purple-400 group-hover:text-purple-100 transition-colors duration-300 mb-6 flex-grow">
                    {type.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold bg-gradient-to-r ${type.gradient} text-white shadow-md hover:shadow-lg transform group-hover:scale-105 transition-all duration-300`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(type.route);
                    }}
                  >
                    Get Started
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-purple-500 dark:text-purple-400 text-sm">
            You can save your progress as a draft at any time
          </p>
        </div>
      </div>
    </div>
  );
}

