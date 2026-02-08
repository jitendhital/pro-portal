import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import MultiStepWizard from '../components/MultiStepWizard';
import {
  GuestRulesStep,
  BBQCalculatorStep,
  CampfireSoundStep,
  TotalPricePreview,
} from '../components/NightStayComponents';
import { useToast } from '../contexts/ToastContext';

/**
 * Create Night-Stay Listing Page
 * Uses the MultiStepWizard with Night-Stay specific steps
 */
export default function CreateNightStayListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem('listing-draft-night-stay');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setInitialData(draftData);
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, []);

  // Night-Stay specific steps - these will receive formData from MultiStepWizard
  const nightStaySteps = [
    {
      id: 'guest-rules',
      title: 'Guest Rules',
      component: GuestRulesStep,
    },
    {
      id: 'bbq',
      title: 'BBQ Service',
      component: BBQCalculatorStep,
    },
    {
      id: 'campfire-sound',
      title: 'Additional Services',
      component: CampfireSoundStep,
    },
  ];

  const handleSubmit = async (wizardFormData) => {
    if (!currentUser) {
      showError('Please sign in to create a listing');
      navigate('/signIn');
      return;
    }

    // wizardFormData already contains all night-stay specific data
    const finalData = {
      ...wizardFormData,
      type: 'night-stay', // Use consistent night-stay type
      listingSubType: 'night-stay',
      bedrooms: wizardFormData.bedrooms || 1,
      regularPrice: parseFloat(wizardFormData.regularPrice),
      discountPrice: wizardFormData.offer ? parseFloat(wizardFormData.discountPrice) : 0,
      userRef: currentUser._id,
      bbqRates: wizardFormData.bbqRates || { chicken: 700, mutton: 2000, fish: 1500 }, // Include custom rates
    };

    setLoading(true);
    try {
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(finalData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showError(data.message || 'Failed to create listing');
        return;
      }

      // Clear draft
      localStorage.removeItem('listing-draft-night-stay');
      success('Night-Stay listing created successfully!');
      navigate(`/listing/${data.listing._id}`);
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Error creating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-purple-600">Please sign in to create a listing</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <MultiStepWizard
        listingType="night-stay"
        onSubmit={handleSubmit}
        initialData={initialData}
        additionalSteps={nightStaySteps}
      />

      {/* Floating Price Preview - will be shown when regularPrice is set */}
      {initialData?.regularPrice && (
        <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 w-80 z-10">
          <TotalPricePreview formData={{ ...initialData, regularPrice: initialData.regularPrice || 0 }} />
        </div>
      )}
    </div>
  );
}

