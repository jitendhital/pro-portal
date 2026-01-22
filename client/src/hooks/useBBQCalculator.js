import { useState, useMemo } from 'react';

/**
 * Custom hook for BBQ price calculation
 * Calculates individual and total BBQ prices based on weight inputs
 * @param {boolean} enabled - Whether BBQ is enabled
 * @returns {Object} BBQ calculation state and methods
 */
export function useBBQCalculator(enabled = false) {
  const [chickenKg, setChickenKg] = useState(0);
  const [muttonKg, setMuttonKg] = useState(0);
  const [fishKg, setFishKg] = useState(0);

  // Fixed rates per kg
  const RATES = {
    chicken: 700,
    mutton: 2000,
    fish: 1500,
  };

  // Calculate individual prices
  const calculations = useMemo(() => {
    if (!enabled) {
      return {
        chickenPrice: 0,
        muttonPrice: 0,
        fishPrice: 0,
        total: 0,
      };
    }

    const chickenPrice = chickenKg * RATES.chicken;
    const muttonPrice = muttonKg * RATES.mutton;
    const fishPrice = fishKg * RATES.fish;
    const total = chickenPrice + muttonPrice + fishPrice;

    return {
      chickenPrice,
      muttonPrice,
      fishPrice,
      total,
    };
  }, [enabled, chickenKg, muttonKg, fishKg]);

  const reset = () => {
    setChickenKg(0);
    setMuttonKg(0);
    setFishKg(0);
  };

  return {
    chickenKg,
    muttonKg,
    fishKg,
    setChickenKg,
    setMuttonKg,
    setFishKg,
    calculations,
    rates: RATES,
    reset,
  };
}

