import { useState, useEffect } from 'react';
import { FaUsers, FaClock, FaFire, FaMusic } from 'react-icons/fa';
import { useBBQCalculator } from '../hooks/useBBQCalculator';

/**
 * Guest Rules Step Component for Night-Stay listings
 */
export function GuestRulesStep({ formData, setFormData, formErrors, setFormErrors }) {
  const [checkInTime, setCheckInTime] = useState(formData.checkInTime || '14:00');
  const [checkOutTime, setCheckOutTime] = useState(formData.checkOutTime || '14:00');

  // Auto-set checkout time to 24 hours after check-in
  useEffect(() => {
    if (checkInTime) {
      const [hours, minutes] = checkInTime.split(':').map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(hours, minutes, 0, 0);
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setHours(checkOutDate.getHours() + 24);
      
      const checkoutHours = String(checkOutDate.getHours()).padStart(2, '0');
      const checkoutMinutes = String(checkOutDate.getMinutes()).padStart(2, '0');
      const newCheckOutTime = `${checkoutHours}:${checkoutMinutes}`;
      
      setCheckOutTime(newCheckOutTime);
      setFormData({ ...formData, checkInTime, checkOutTime: newCheckOutTime });
    }
  }, [checkInTime]);

  const categories = ['student', 'couple', 'family'];
  const selectedCategories = formData.categories || [];

  const toggleCategory = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setFormData({ ...formData, categories: newCategories });
  };

  return (
    <div className="space-y-6">
      {/* Max Guests */}
      <div>
        <label htmlFor="maxGuests" className="block text-sm font-medium text-purple-700 mb-2">
          Maximum Guests <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="maxGuests"
          min="1"
          max="20"
          value={formData.maxGuests || ''}
          onChange={(e) => {
            setFormData({ ...formData, maxGuests: parseInt(e.target.value) || '' });
            if (formErrors.maxGuests) setFormErrors({ ...formErrors, maxGuests: '' });
          }}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            formErrors.maxGuests ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter maximum number of guests"
          required
        />
        {formErrors.maxGuests && (
          <p className="text-red-500 text-sm mt-1">{formErrors.maxGuests}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-purple-700 mb-3">
          Suitable For <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                selectedCategories.includes(category)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-700 border-purple-300 hover:border-purple-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {selectedCategories.length === 0 && (
          <p className="text-red-500 text-sm mt-1">Please select at least one category</p>
        )}
      </div>

      {/* House Rules */}
      <div>
        <label htmlFor="houseRules" className="block text-sm font-medium text-purple-700 mb-2">
          House Rules
        </label>
        <textarea
          id="houseRules"
          value={formData.houseRules || ''}
          onChange={(e) => setFormData({ ...formData, houseRules: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
        />
      </div>

      {/* Check-in/Check-out Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkInTime" className="block text-sm font-medium text-purple-700 mb-2">
            Check-in Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 top-3 text-purple-500" />
            <input
              type="time"
              id="checkInTime"
              value={checkInTime}
              onChange={(e) => {
                setCheckInTime(e.target.value);
                setFormData({ ...formData, checkInTime: e.target.value });
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="checkOutTime" className="block text-sm font-medium text-purple-700 mb-2">
            Check-out Time (24-hour stay)
          </label>
          <div className="relative">
            <FaClock className="absolute left-3 top-3 text-purple-500" />
            <input
              type="time"
              id="checkOutTime"
              value={checkOutTime}
              readOnly
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-purple-600 mt-1">Automatically set to 24 hours after check-in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BBQ Calculator Component for Night-Stay listings
 */
export function BBQCalculatorStep({ formData, setFormData }) {
  const {
    chickenKg,
    muttonKg,
    fishKg,
    setChickenKg,
    setMuttonKg,
    setFishKg,
    calculations,
    rates,
  } = useBBQCalculator(formData.bbqEnabled || false);

  useEffect(() => {
    setFormData({
      ...formData,
      bbqPrice: calculations.total,
      bbqDetails: {
        chickenKg,
        muttonKg,
        fishKg,
        chickenPrice: calculations.chickenPrice,
        muttonPrice: calculations.muttonPrice,
        fishPrice: calculations.fishPrice,
      },
    });
  }, [calculations.total, chickenKg, muttonKg, fishKg]);

  return (
    <div className="space-y-6">
      {/* BBQ Toggle */}
      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
        <div>
          <h3 className="font-semibold text-purple-800 mb-1">BBQ Service</h3>
          <p className="text-sm text-purple-600">Enable BBQ service with custom pricing</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.bbqEnabled || false}
            onChange={(e) => setFormData({ ...formData, bbqEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {formData.bbqEnabled && (
        <div className="space-y-4 p-4 bg-white border-2 border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-4">BBQ Items</h4>

          {/* Chicken */}
          <div>
            <label htmlFor="chickenKg" className="block text-sm font-medium text-purple-700 mb-2">
              Chicken (Rs {rates.chicken}/kg)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                id="chickenKg"
                min="0"
                step="0.5"
                value={chickenKg}
                onChange={(e) => setChickenKg(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
              <div className="w-32 px-4 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold flex items-center justify-center">
                Rs {calculations.chickenPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Mutton */}
          <div>
            <label htmlFor="muttonKg" className="block text-sm font-medium text-purple-700 mb-2">
              Mutton (Rs {rates.mutton}/kg)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                id="muttonKg"
                min="0"
                step="0.5"
                value={muttonKg}
                onChange={(e) => setMuttonKg(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
              <div className="w-32 px-4 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold flex items-center justify-center">
                Rs {calculations.muttonPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Fish */}
          <div>
            <label htmlFor="fishKg" className="block text-sm font-medium text-purple-700 mb-2">
              Fish (Rs {rates.fish}/kg)
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                id="fishKg"
                min="0"
                step="0.5"
                value={fishKg}
                onChange={(e) => setFishKg(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0"
              />
              <div className="w-32 px-4 py-2 bg-purple-50 rounded-lg text-purple-700 font-semibold flex items-center justify-center">
                Rs {calculations.fishPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Total BBQ Price */}
          <div className="pt-4 border-t-2 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-purple-800">Total BBQ Price:</span>
              <span className="text-2xl font-bold text-purple-600">
                Rs {calculations.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Campfire and Sound System Component
 */
export function CampfireSoundStep({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      {/* Campfire */}
      <div className="p-4 bg-white border-2 border-purple-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaFire className="text-2xl text-orange-500" />
            <div>
              <h3 className="font-semibold text-purple-800">Campfire</h3>
              <p className="text-sm text-purple-600">Evening campfire experience</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.campfireEnabled || false}
              onChange={(e) => setFormData({ ...formData, campfireEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        {formData.campfireEnabled && (
          <div>
            <label htmlFor="campfirePrice" className="block text-sm font-medium text-purple-700 mb-2">
              Campfire Price (Rs)
            </label>
            <input
              type="number"
              id="campfirePrice"
              min="0"
              value={formData.campfirePrice || ''}
              onChange={(e) => setFormData({ ...formData, campfirePrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter price"
            />
          </div>
        )}
      </div>

      {/* Sound System */}
      <div className="p-4 bg-white border-2 border-purple-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaMusic className="text-2xl text-purple-500" />
            <div>
              <h3 className="font-semibold text-purple-800">Sound System</h3>
              <p className="text-sm text-purple-600">Music system for your stay</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.soundSystemEnabled || false}
              onChange={(e) => setFormData({ ...formData, soundSystemEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        {formData.soundSystemEnabled && (
          <div>
            <label htmlFor="soundSystemPrice" className="block text-sm font-medium text-purple-700 mb-2">
              Sound System Price (Rs)
            </label>
            <input
              type="number"
              id="soundSystemPrice"
              min="0"
              value={formData.soundSystemPrice || ''}
              onChange={(e) => setFormData({ ...formData, soundSystemPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter price"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Total Price Preview Component
 * Shows dynamic total calculation for Night-Stay listings
 */
export function TotalPricePreview({ formData }) {
  const calculateTotal = () => {
    let total = parseFloat(formData.regularPrice) || 0;
    
    if (formData.bbqEnabled && formData.bbqPrice) {
      total += parseFloat(formData.bbqPrice);
    }
    
    if (formData.campfireEnabled && formData.campfirePrice) {
      total += parseFloat(formData.campfirePrice);
    }
    
    if (formData.soundSystemEnabled && formData.soundSystemPrice) {
      total += parseFloat(formData.soundSystemPrice);
    }
    
    return total;
  };

  const total = calculateTotal();

  return (
    <div className="sticky top-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-2xl p-6 text-white">
      <h3 className="text-xl font-bold mb-4">Price Summary</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Base Price:</span>
          <span>Rs {parseFloat(formData.regularPrice || 0).toLocaleString()}</span>
        </div>
        
        {formData.bbqEnabled && formData.bbqPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span>BBQ Service:</span>
            <span>Rs {parseFloat(formData.bbqPrice).toLocaleString()}</span>
          </div>
        )}
        
        {formData.campfireEnabled && formData.campfirePrice > 0 && (
          <div className="flex justify-between text-sm">
            <span>Campfire:</span>
            <span>Rs {parseFloat(formData.campfirePrice || 0).toLocaleString()}</span>
          </div>
        )}
        
        {formData.soundSystemEnabled && formData.soundSystemPrice > 0 && (
          <div className="flex justify-between text-sm">
            <span>Sound System:</span>
            <span>Rs {parseFloat(formData.soundSystemPrice || 0).toLocaleString()}</span>
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-purple-400">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Price:</span>
          <span className="text-3xl font-bold">Rs {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

