import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findSimilarProperties } from '../utils/propertyRecommendation';
import ListingItem from './ListingItem';
import { SkeletonLoader } from './SkeletonLoader';
import { FaStar } from 'react-icons/fa';

/**
 * Similar Properties Component
 * Uses K-Nearest Neighbors (KNN) algorithm to find similar properties
 * 
 * Algorithm: Content-Based Filtering with Weighted Scoring
 * Time Complexity: O(n * m) where n = properties, m = features
 */
export default function SimilarProperties({ currentListing, allListings = [] }) {
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentListing || !allListings || allListings.length === 0) {
      setLoading(false);
      return;
    }

    // Use the recommendation algorithm to find similar properties
    try {
      const similar = findSimilarProperties(currentListing, allListings, 6);
      setSimilarProperties(similar);
    } catch (error) {
      console.error('Error finding similar properties:', error);
    } finally {
      setLoading(false);
    }
  }, [currentListing, allListings]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
          <FaStar className="text-purple-500" />
          Similar Properties (AI Recommended)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} type="listing-card" />
          ))}
        </div>
      </div>
    );
  }

  if (similarProperties.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
        <FaStar className="text-purple-500" />
        Similar Properties
        <span className="text-sm font-normal text-purple-500">
          (AI Recommended - Score: {similarProperties[0]?.recommendationScore?.toFixed(1)}%)
        </span>
      </h2>
      <p className="text-sm text-purple-600 mb-4">
        Properties similar to this one, calculated using our recommendation algorithm
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarProperties.map((property) => (
          <div key={property._id} className="relative">
            <ListingItem listing={property} />
            {property.recommendationScore && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {property.recommendationScore.toFixed(0)}% match
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

