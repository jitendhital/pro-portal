import { useState, useEffect, useMemo } from 'react';
import {
  getRecommendedProperties,
  findSimilarProperties,
  extractPreferencesFromQuery,
} from '../utils/propertyRecommendation';

/**
 * Custom hook for property recommendation system
 * Implements the recommendation algorithm with React hooks
 * 
 * @param {Array} properties - All available properties
 * @param {Object} userPreferences - User's search preferences
 * @param {Object} options - Configuration options
 * @returns {Object} Recommended properties and utility functions
 */
export function usePropertyRecommendation(properties = [], userPreferences = {}, options = {}) {
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize recommendations to avoid recalculating on every render
  const recommendations = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    try {
      setLoading(true);
      
      // Extract preferences from search query if provided
      const extractedPrefs = userPreferences.searchTerm
        ? extractPreferencesFromQuery(userPreferences.searchTerm)
        : {};
      
      const finalPreferences = {
        ...extractedPrefs,
        ...userPreferences,
      };

      // Get recommended properties using the algorithm
      const recommended = getRecommendedProperties(
        properties,
        finalPreferences,
        {
          limit: options.limit || 10,
          minScore: options.minScore || 0,
          weights: options.weights || {},
        }
      );

      return recommended;
    } catch (err) {
      setError(err.message);
      console.error('Error calculating recommendations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [properties, userPreferences, options.limit, options.minScore]);

  useEffect(() => {
    setRecommendedProperties(recommendations);
  }, [recommendations]);

  /**
   * Find similar properties to a given property
   */
  const getSimilarProperties = (property, k = 5) => {
    if (!property || !properties || properties.length === 0) return [];
    
    try {
      return findSimilarProperties(property, properties, k);
    } catch (err) {
      console.error('Error finding similar properties:', err);
      return [];
    }
  };

  return {
    recommendedProperties,
    loading,
    error,
    getSimilarProperties,
  };
}

