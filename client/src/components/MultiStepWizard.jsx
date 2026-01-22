import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCheck, FaUpload, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../supabase';
import { useSelector } from 'react-redux';

/**
 * Multi-Step Wizard Component
 * Reusable form wizard for creating listings
 * @param {Object} props
 * @param {string} props.listingType - Type of listing: 'sell' | 'rent' | 'night-stay'
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Object} props.initialData - Initial form data
 * @param {Array} props.additionalSteps - Additional step components for specific listing types
 */
export default function MultiStepWizard({
  listingType,
  onSubmit,
  initialData = {},
  additionalSteps = [],
}) {
  const { currentUser } = useSelector((state) => state.user);
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => ({
    name: '',
    description: '',
    address: '',
    imageUrls: [],
    parking: false,
    furnished: false,
    bathrooms: 1,
    regularPrice: '',
    discountPrice: '',
    offer: false,
    contactEmail: '',
    contactPhone: '',
    ...initialData,
  }));

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Common steps for all listing types
  const commonSteps = [
    {
      id: 'basic',
      title: 'Basic Information',
      component: BasicInfoStep,
    },
    {
      id: 'details',
      title: 'Property Details',
      component: PropertyDetailsStep,
    },
    {
      id: 'images',
      title: 'Images',
      component: ImagesStep,
    },
    {
      id: 'pricing',
      title: 'Pricing',
      component: PricingStep,
    },
    {
      id: 'contact',
      title: 'Contact Information',
      component: ContactStep,
    },
  ];

  const allSteps = [...commonSteps, ...additionalSteps];
  const totalSteps = allSteps.length;

  // Basic Info Step Component
  function BasicInfoStep() {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-purple-700 mb-2">
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Beautiful 3BHK Apartment"
            required
          />
          {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-purple-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
            }}
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              formErrors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your property in detail..."
            required
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-purple-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-purple-500" />
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
              }}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                formErrors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full address"
              required
            />
          </div>
          {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
        </div>
      </div>
    );
  }

  // Property Details Step Component
  function PropertyDetailsStep() {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-purple-700 mb-2">
            Number of Bathrooms <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="bathrooms"
            min="1"
            max="10"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-purple-700">Amenities</label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="parking"
              checked={formData.parking}
              onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="parking" className="text-gray-700 cursor-pointer">
              Parking Spot Available
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="furnished"
              checked={formData.furnished}
              onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="furnished" className="text-gray-700 cursor-pointer">
              Fully Furnished
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Images Step Component
  function ImagesStep() {
    const handleImageUpload = async () => {
      if (files.length === 0) return;
      if (files.length + formData.imageUrls.length > 6) {
        showError('You can only upload 6 images maximum');
        return;
      }

      setUploading(true);
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${currentUser._id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `listings/${fileName}`;

          const { data, error: uploadError } = await supabase.storage
            .from('Jiten-portal')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('Jiten-portal')
            .getPublicUrl(data.path);

          return publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ...urls] });
        setFiles([]);
        success('Images uploaded successfully');
      } catch (err) {
        showError('Image upload failed. Please try again.');
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    const removeImage = (index) => {
      setFormData({
        ...formData,
        imageUrls: formData.imageUrls.filter((_, i) => i !== index),
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Upload Images (Max 6) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={uploading || formData.imageUrls.length >= 6}
            />
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={uploading || files.length === 0 || formData.imageUrls.length >= 6}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaUpload />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {formData.imageUrls.length === 0 && (
            <p className="text-red-500 text-sm mt-1">At least one image is required</p>
          )}
        </div>

        {formData.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pricing Step Component
  function PricingStep() {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="regularPrice" className="block text-sm font-medium text-purple-700 mb-2">
            Regular Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="regularPrice"
            min="0"
            value={formData.regularPrice}
            onChange={(e) => {
              setFormData({ ...formData, regularPrice: e.target.value });
              if (formErrors.regularPrice) setFormErrors({ ...formErrors, regularPrice: '' });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              formErrors.regularPrice ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter price"
            required
          />
          {formErrors.regularPrice && (
            <p className="text-red-500 text-sm mt-1">{formErrors.regularPrice}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="offer"
            checked={formData.offer}
            onChange={(e) => setFormData({ ...formData, offer: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="offer" className="text-gray-700 cursor-pointer">
            Offer Discount Price
          </label>
        </div>

        {formData.offer && (
          <div>
            <label htmlFor="discountPrice" className="block text-sm font-medium text-purple-700 mb-2">
              Discount Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="discountPrice"
              min="0"
              value={formData.discountPrice}
              onChange={(e) => {
                setFormData({ ...formData, discountPrice: e.target.value });
                if (formErrors.discountPrice) setFormErrors({ ...formErrors, discountPrice: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                formErrors.discountPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter discount price"
              required={formData.offer}
            />
            {formErrors.discountPrice && (
              <p className="text-red-500 text-sm mt-1">{formErrors.discountPrice}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Contact Step Component
  function ContactStep() {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-purple-700 mb-2">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => {
              setFormData({ ...formData, contactEmail: e.target.value });
              if (formErrors.contactEmail) setFormErrors({ ...formErrors, contactEmail: '' });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              formErrors.contactEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
            required
          />
          {formErrors.contactEmail && (
            <p className="text-red-500 text-sm mt-1">{formErrors.contactEmail}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-purple-700 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="+1234567890"
          />
        </div>
      </div>
    );
  }

  // Validation
  const validateStep = (stepIndex) => {
    const step = allSteps[stepIndex];
    const newErrors = {};

    if (step.id === 'basic') {
      if (!formData.name.trim()) newErrors.name = 'Property title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    if (step.id === 'images') {
      if (formData.imageUrls.length === 0) {
        newErrors.images = 'At least one image is required';
      }
    }

    if (step.id === 'pricing') {
      if (!formData.regularPrice || Number(formData.regularPrice) <= 0) {
        newErrors.regularPrice = 'Regular price must be greater than 0';
      }
      if (formData.offer && (!formData.discountPrice || Number(formData.discountPrice) >= Number(formData.regularPrice))) {
        newErrors.discountPrice = 'Discount price must be less than regular price';
      }
    }

    if (step.id === 'contact') {
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Contact email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // Save to localStorage as draft
      const draftData = {
        ...formData,
        listingType,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`listing-draft-${listingType}`, JSON.stringify(draftData));
      success('Draft saved successfully');
    } catch (err) {
      showError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Final validation
    const finalErrors = {};
    if (!formData.name.trim()) finalErrors.name = 'Property title is required';
    if (!formData.description.trim()) finalErrors.description = 'Description is required';
    if (!formData.address.trim()) finalErrors.address = 'Address is required';
    if (formData.imageUrls.length === 0) finalErrors.images = 'At least one image is required';
    if (!formData.regularPrice || Number(formData.regularPrice) <= 0) {
      finalErrors.regularPrice = 'Regular price is required';
    }
    if (!formData.contactEmail.trim()) {
      finalErrors.contactEmail = 'Contact email is required';
    }

    if (Object.keys(finalErrors).length > 0) {
      setFormErrors(finalErrors);
      showError('Please fix all errors before submitting');
      return;
    }

    await onSubmit(formData);
  };

  const StepComponent = allSteps[currentStep].component;
  const isAdditionalStep = additionalSteps.some(step => step.id === allSteps[currentStep].id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {allSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < currentStep
                        ? 'bg-purple-600 text-white'
                        : index === currentStep
                        ? 'bg-purple-500 text-white ring-4 ring-purple-200'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? <FaCheck /> : index + 1}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      index === currentStep ? 'text-purple-600 font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < allSteps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-purple-800 mb-6">
            {allSteps[currentStep].title}
          </h2>
          {isAdditionalStep ? (
            <StepComponent
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
            />
          ) : (
            <StepComponent />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <FaChevronLeft />
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                Next
                <FaChevronRight />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaCheck />
                Submit Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

