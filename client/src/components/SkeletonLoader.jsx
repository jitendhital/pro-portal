/**
 * Skeleton Loader Component
 * Provides loading placeholders for various content types
 */
export function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'text') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'listing-detail') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Empty State Component
 * Displays when no results are found
 */
export function EmptyState({ 
  title = 'No results found', 
  message = 'Try adjusting your filters or search terms',
  icon: Icon,
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 text-purple-300">
          <Icon className="text-6xl" />
        </div>
      )}
      <h3 className="text-2xl font-semibold text-purple-800 mb-2">{title}</h3>
      <p className="text-purple-600 mb-6 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

