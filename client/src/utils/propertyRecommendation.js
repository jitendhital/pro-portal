/**
 * Property Recommendation & Matching Algorithm
 * 
 * This algorithm implements a weighted scoring system to match user preferences
 * with available properties, ranking them by relevance.
 * 
 * Algorithm Type: Content-Based Filtering with Weighted Scoring
 * Time Complexity: O(n * m) where n = number of properties, m = number of features
 * Space Complexity: O(n) for storing scored properties
 * 
 * Features:
 * - Multi-criteria matching (price, location, amenities, type)
 * - Weighted scoring system (configurable importance weights)
 * - Normalized scores (0-100 scale)
 * - Handles missing data gracefully
 */

/**
 * Calculate similarity score between user preferences and a property
 * @param {Object} property - Property listing object
 * @param {Object} preferences - User preferences object
 * @param {Object} weights - Weight configuration for different criteria
 * @returns {Object} Property with calculated score and breakdown
 */
export function calculatePropertyScore(property, preferences, weights = {}) {
  // Default weights (can be customized)
  const defaultWeights = {
    price: 0.25,           // 25% weight
    location: 0.20,        // 20% weight
    amenities: 0.20,       // 20% weight
    type: 0.15,            // 15% weight
    size: 0.10,            // 10% weight
    recency: 0.10,         // 10% weight (how recent the listing is)
  };

  const finalWeights = { ...defaultWeights, ...weights };
  
  let totalScore = 0;
  const scoreBreakdown = {};

  // 1. Price Score (0-100)
  // Lower price difference = higher score
  if (preferences.maxPrice && property.regularPrice) {
    const priceDiff = Math.abs(property.regularPrice - preferences.maxPrice);
    const priceRange = preferences.maxPrice - (preferences.minPrice || 0);
    const priceScore = priceRange > 0 
      ? Math.max(0, 100 - (priceDiff / priceRange) * 100)
      : property.regularPrice <= preferences.maxPrice ? 100 : 0;
    
    // Bonus for offers/discounts
    if (property.offer && property.discountPrice) {
      const discountBonus = ((property.regularPrice - property.discountPrice) / property.regularPrice) * 20;
      scoreBreakdown.price = Math.min(100, priceScore + discountBonus);
    } else {
      scoreBreakdown.price = priceScore;
    }
    
    totalScore += scoreBreakdown.price * finalWeights.price;
  } else {
    scoreBreakdown.price = 50; // Neutral score if no price preference
    totalScore += 50 * finalWeights.price;
  }

  // 2. Location Score (0-100)
  // String similarity for address matching
  if (preferences.location && property.address) {
    const locationMatch = calculateStringSimilarity(
      preferences.location.toLowerCase(),
      property.address.toLowerCase()
    );
    scoreBreakdown.location = locationMatch * 100;
    totalScore += scoreBreakdown.location * finalWeights.location;
  } else {
    scoreBreakdown.location = 50;
    totalScore += 50 * finalWeights.location;
  }

  // 3. Amenities Score (0-100)
  // Count matching amenities
  const amenityMatches = [];
  if (preferences.parking !== undefined && property.parking === preferences.parking) {
    amenityMatches.push('parking');
  }
  if (preferences.furnished !== undefined && property.furnished === preferences.furnished) {
    amenityMatches.push('furnished');
  }
  
  // Night-Stay specific amenities
  if (preferences.bbqAvailable && property.bbqEnabled) amenityMatches.push('bbq');
  if (preferences.campfireAvailable && property.campfireEnabled) amenityMatches.push('campfire');
  if (preferences.soundSystemAvailable && property.soundSystemEnabled) amenityMatches.push('soundSystem');
  
  const totalPossibleMatches = 3 + (preferences.bbqAvailable ? 1 : 0) + 
                               (preferences.campfireAvailable ? 1 : 0) + 
                               (preferences.soundSystemAvailable ? 1 : 0);
  
  scoreBreakdown.amenities = totalPossibleMatches > 0 
    ? (amenityMatches.length / totalPossibleMatches) * 100 
    : 50;
  totalScore += scoreBreakdown.amenities * finalWeights.amenities;

  // 4. Type Score (0-100)
  // Exact match = 100, partial match = 50, no match = 0
  if (preferences.listingType && preferences.listingType !== 'all') {
    if (property.type === preferences.listingType || 
        (preferences.listingType === 'night-stay' && property.listingSubType === 'night-stay')) {
      scoreBreakdown.type = 100;
    } else {
      scoreBreakdown.type = 0;
    }
  } else {
    scoreBreakdown.type = 50; // Neutral if no type preference
  }
  totalScore += scoreBreakdown.type * finalWeights.type;

  // 5. Size Score (0-100)
  // Based on bedrooms and bathrooms
  if (preferences.bedrooms && property.bedrooms) {
    const bedroomScore = property.bedrooms >= preferences.bedrooms ? 100 : 
                        (property.bedrooms / preferences.bedrooms) * 100;
    const bathroomScore = property.bathrooms >= preferences.bathrooms ? 100 : 
                         (property.bathrooms / preferences.bathrooms) * 100;
    scoreBreakdown.size = (bedroomScore + bathroomScore) / 2;
  } else {
    scoreBreakdown.size = 50;
  }
  totalScore += scoreBreakdown.size * finalWeights.size;

  // 6. Recency Score (0-100)
  // Newer listings get higher scores
  if (property.createdAt) {
    const daysSinceCreation = (Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    // Score decreases over time, max 30 days
    scoreBreakdown.recency = Math.max(0, 100 - (daysSinceCreation / 30) * 100);
  } else {
    scoreBreakdown.recency = 50;
  }
  totalScore += scoreBreakdown.recency * finalWeights.recency;

  return {
    ...property,
    recommendationScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    scoreBreakdown,
  };
}

/**
 * Calculate string similarity using Levenshtein distance (normalized)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateStringSimilarity(str1, str2) {
  // Simple word-based matching for better performance
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matches = 0;
  words1.forEach(word => {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });
  
  return matches / Math.max(words1.length, words2.length);
}

/**
 * Sort properties by recommendation score using Quick Sort algorithm
 * @param {Array} properties - Array of properties with scores
 * @param {string} order - 'desc' for descending (highest first), 'asc' for ascending
 * @returns {Array} Sorted array of properties
 * 
 * Time Complexity: O(n log n) average case, O(n²) worst case
 * Space Complexity: O(log n) for recursion stack
 */
export function sortPropertiesByScore(properties, order = 'desc') {
  if (properties.length <= 1) return properties;

  // Quick Sort implementation
  const pivot = properties[Math.floor(properties.length / 2)];
  const left = [];
  const middle = [];
  const right = [];

  properties.forEach(prop => {
    const score = prop.recommendationScore || 0;
    const pivotScore = pivot.recommendationScore || 0;
    
    if (score < pivotScore) {
      left.push(prop);
    } else if (score > pivotScore) {
      right.push(prop);
    } else {
      middle.push(prop);
    }
  });

  const sorted = [
    ...sortPropertiesByScore(right, order),
    ...middle,
    ...sortPropertiesByScore(left, order),
  ];

  return order === 'desc' ? sorted : sorted.reverse();
}

/**
 * Get top N recommended properties
 * @param {Array} properties - Array of all properties
 * @param {Object} preferences - User preferences
 * @param {Object} options - Configuration options
 * @returns {Array} Top N recommended properties with scores
 * 
 * Time Complexity: O(n * m + n log n) where n = properties, m = features
 */
export function getRecommendedProperties(properties, preferences, options = {}) {
  const {
    limit = 10,
    weights = {},
    minScore = 0,
  } = options;

  // Step 1: Calculate scores for all properties - O(n * m)
  const scoredProperties = properties.map(property => 
    calculatePropertyScore(property, preferences, weights)
  );

  // Step 2: Filter by minimum score
  const filteredProperties = scoredProperties.filter(
    prop => prop.recommendationScore >= minScore
  );

  // Step 3: Sort by score - O(n log n)
  const sortedProperties = sortPropertiesByScore(filteredProperties, 'desc');

  // Step 4: Return top N - O(1)
  return sortedProperties.slice(0, limit);
}

/**
 * Find similar properties to a given property
 * Uses K-Nearest Neighbors (KNN) approach
 * @param {Object} targetProperty - The property to find similar ones for
 * @param {Array} allProperties - All available properties
 * @param {number} k - Number of similar properties to return
 * @returns {Array} K most similar properties
 * 
 * Time Complexity: O(n * m) where n = properties, m = features
 */
export function findSimilarProperties(targetProperty, allProperties, k = 5) {
  // Create preferences based on target property
  const preferences = {
    maxPrice: targetProperty.regularPrice * 1.2, // 20% price range
    minPrice: targetProperty.regularPrice * 0.8,
    location: targetProperty.address,
    parking: targetProperty.parking,
    furnished: targetProperty.furnished,
    listingType: targetProperty.type,
    bedrooms: targetProperty.bedrooms,
    bathrooms: targetProperty.bathrooms,
  };

  // Calculate similarity scores
  const similarProperties = allProperties
    .filter(prop => prop._id !== targetProperty._id) // Exclude the target property
    .map(prop => calculatePropertyScore(prop, preferences))
    .filter(prop => prop.recommendationScore > 30); // Minimum similarity threshold

  // Sort and return top K
  return sortPropertiesByScore(similarProperties, 'desc').slice(0, k);
}

/**
 * Analyze search query and extract preferences
 * Simple keyword extraction algorithm
 * @param {string} searchTerm - User's search query
 * @returns {Object} Extracted preferences
 */
export function extractPreferencesFromQuery(searchTerm) {
  const preferences = {};
  const lowerQuery = searchTerm.toLowerCase();

  // Extract price mentions
  const priceMatch = lowerQuery.match(/(\d+)\s*(?:lakh|lac|k|thousand|million)/i);
  if (priceMatch) {
    let price = parseInt(priceMatch[1]);
    if (lowerQuery.includes('lakh') || lowerQuery.includes('lac')) {
      price *= 100000;
    } else if (lowerQuery.includes('k') || lowerQuery.includes('thousand')) {
      price *= 1000;
    } else if (lowerQuery.includes('million')) {
      price *= 1000000;
    }
    preferences.maxPrice = price;
  }

  // Extract property type
  if (lowerQuery.includes('apartment') || lowerQuery.includes('flat')) {
    preferences.propertyType = 'apartment';
  } else if (lowerQuery.includes('house') || lowerQuery.includes('villa')) {
    preferences.propertyType = 'house';
  }

  // Extract amenities
  if (lowerQuery.includes('parking') || lowerQuery.includes('garage')) {
    preferences.parking = true;
  }
  if (lowerQuery.includes('furnished')) {
    preferences.furnished = true;
  }

  return preferences;
}

