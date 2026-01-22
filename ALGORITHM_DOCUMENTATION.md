# Property Recommendation Algorithm - Documentation

## Overview
This document describes the **Property Recommendation & Matching Algorithm** implemented in the JitenEstate platform. This algorithm is designed to match user preferences with available properties using a weighted scoring system.

## Algorithm Type
**Content-Based Filtering with Weighted Scoring**

## Algorithm Description

### 1. Core Algorithm: Weighted Scoring System

The algorithm calculates a relevance score for each property based on multiple criteria:

#### Scoring Criteria:
1. **Price Match (25% weight)**
   - Calculates the difference between property price and user's budget
   - Formula: `score = 100 - (priceDifference / priceRange) * 100`
   - Bonus points for discounted properties

2. **Location Match (20% weight)**
   - Uses string similarity algorithm (word-based matching)
   - Compares user's preferred location with property address
   - Formula: `similarity = matchingWords / totalWords`

3. **Amenities Match (20% weight)**
   - Counts matching amenities (parking, furnished, BBQ, campfire, sound system)
   - Formula: `score = (matchedAmenities / totalPossibleMatches) * 100`

4. **Property Type (15% weight)**
   - Exact match = 100 points
   - No match = 0 points

5. **Size Match (10% weight)**
   - Based on bedrooms and bathrooms
   - Formula: `score = (bedroomScore + bathroomScore) / 2`

6. **Recency (10% weight)**
   - Newer listings get higher scores
   - Formula: `score = 100 - (daysSinceCreation / 30) * 100`

### 2. String Similarity Algorithm

**Algorithm**: Word-based matching
- Splits strings into words
- Counts matching words (including partial matches)
- Returns similarity ratio: `matches / max(wordCount1, wordCount2)`

**Time Complexity**: O(n * m) where n = words in str1, m = words in str2

### 3. Sorting Algorithm: Quick Sort

**Algorithm**: Quick Sort (Recursive)
- Pivots on middle element
- Partitions into left, middle, right arrays
- Recursively sorts sub-arrays

**Time Complexity**: 
- Average: O(n log n)
- Worst: O(n²)
- Best: O(n log n)

**Space Complexity**: O(log n) for recursion stack

### 4. K-Nearest Neighbors (KNN) for Similar Properties

**Algorithm**: Content-Based KNN
- Creates preferences based on target property
- Calculates similarity scores for all other properties
- Returns top K most similar properties

**Time Complexity**: O(n * m) where n = properties, m = features

## Overall Complexity Analysis

### For Single Property Scoring:
- **Time Complexity**: O(m) where m = number of features
- **Space Complexity**: O(1)

### For Full Recommendation:
- **Time Complexity**: O(n * m + n log n)
  - O(n * m) for calculating all scores
  - O(n log n) for sorting
- **Space Complexity**: O(n) for storing scored properties

Where:
- n = number of properties
- m = number of features/criteria

## Implementation Details

### Files:
1. `client/src/utils/propertyRecommendation.js` - Core algorithm implementation
2. `client/src/hooks/usePropertyRecommendation.js` - React hook wrapper
3. `client/src/components/SimilarProperties.jsx` - UI component using the algorithm

### Key Functions:

#### `calculatePropertyScore(property, preferences, weights)`
- Calculates weighted score for a single property
- Returns property object with `recommendationScore` and `scoreBreakdown`

#### `sortPropertiesByScore(properties, order)`
- Sorts properties using Quick Sort
- Returns sorted array

#### `getRecommendedProperties(properties, preferences, options)`
- Main recommendation function
- Filters, scores, and sorts all properties
- Returns top N recommendations

#### `findSimilarProperties(targetProperty, allProperties, k)`
- KNN implementation
- Finds K most similar properties to target

## Usage Example

```javascript
import { getRecommendedProperties } from '../utils/propertyRecommendation';

const preferences = {
  maxPrice: 50000,
  minPrice: 20000,
  location: 'Downtown',
  parking: true,
  furnished: true,
  listingType: 'rent',
  bedrooms: 2,
  bathrooms: 1,
};

const recommended = getRecommendedProperties(
  allProperties,
  preferences,
  {
    limit: 10,
    minScore: 50,
    weights: {
      price: 0.3,
      location: 0.25,
      // ... other weights
    }
  }
);
```

## Advantages

1. **Scalable**: Handles large datasets efficiently
2. **Customizable**: Weights can be adjusted based on business needs
3. **Transparent**: Provides score breakdown for each property
4. **Fast**: O(n log n) sorting ensures quick results
5. **Flexible**: Works with any property features

## Future Enhancements

1. **Machine Learning Integration**: Train ML model on user behavior
2. **Collaborative Filtering**: Recommend based on similar users
3. **Location-Based**: Use geolocation for distance calculation
4. **User Feedback Loop**: Adjust weights based on user interactions
5. **Caching**: Cache recommendations for frequently searched queries

## Academic Value

This algorithm demonstrates:
- **Data Structures**: Arrays, Objects, Priority Queues (implicit)
- **Algorithms**: Quick Sort, String Matching, KNN
- **Complexity Analysis**: Time and Space complexity calculations
- **Real-world Application**: Practical use in e-commerce/recommendation systems
- **Optimization**: Efficient sorting and filtering techniques

## References

1. Quick Sort Algorithm - Introduction to Algorithms (CLRS)
2. Content-Based Filtering - Recommender Systems Handbook
3. K-Nearest Neighbors - Pattern Recognition and Machine Learning
4. String Similarity - Information Retrieval Techniques

