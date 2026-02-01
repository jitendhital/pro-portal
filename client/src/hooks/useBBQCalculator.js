import { useState, useMemo } from 'react';

/**
 * Custom hook for BBQ price calculation
 * Calculates individual and total BBQ prices based on weight inputs
 * @param {boolean} enabled - Whether BBQ is enabled
 * @param {Object} initialValues - Initial values for chickenKg, muttonKg, fishKg
 * @returns {Object} BBQ calculation state and methods
 */
export function useBBQCalculator(enabled = false, initialValues = {}, customRates = {}) {
  const [chickenKg, setChickenKg] = useState(initialValues.chickenKg || 0);
  const [muttonKg, setMuttonKg] = useState(initialValues.muttonKg || 0);
  const [fishKg, setFishKg] = useState(initialValues.fishKg || 0);

  // Default rates
  const DEFAULT_RATES = {
    chicken: 700,
    mutton: 2000,
    fish: 1500,
  };

  // Merge custom rates with defaults
  const RATES = useMemo(() => ({
    chicken: customRates.chicken || DEFAULT_RATES.chicken,
    mutton: customRates.mutton || DEFAULT_RATES.mutton,
    fish: customRates.fish || DEFAULT_RATES.fish,
  }), [customRates]);

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

