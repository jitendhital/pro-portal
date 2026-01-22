import { useState, useEffect } from 'react';

/**
 * Custom hook for managing favorite listings
 * Uses localStorage to persist favorites
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorite-listings');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('favorite-listings', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (listingId) => {
    if (!favorites.includes(listingId)) {
      setFavorites([...favorites, listingId]);
    }
  };

  const removeFavorite = (listingId) => {
    setFavorites(favorites.filter((id) => id !== listingId));
  };

  const toggleFavorite = (listingId) => {
    if (favorites.includes(listingId)) {
      removeFavorite(listingId);
      return false;
    } else {
      addFavorite(listingId);
      return true;
    }
  };

  const isFavorite = (listingId) => {
    return favorites.includes(listingId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}

