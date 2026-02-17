import { useNavigate, useParams } from 'react-router-dom';
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
 * Update Listing Page
 * Uses MultiStepWizard to update listings of all types (sell, rent, night-stay)
 */
export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [listingType, setListingType] = useState('sell'); // 'sell', 'rent', or 'night-stay'

  // Fetch existing listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setFetchLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (data.success === false) {
          showError(data.message || 'Failed to fetch listing');
          setFetchLoading(false);
          return;
        }

        // Verify the user owns this listing
        if (data.listing.userRef !== currentUser._id) {
          showError('You can only edit your own listings');
          setFetchLoading(false);
          return;
        }

        // Determine listing type
        const isNightStay = data.listing.listingSubType === 'night-stay';
        const type = isNightStay ? 'night-stay' : data.listing.type === 'sale' ? 'sell' : 'rent';
        setListingType(type);

        // Populate form with existing listing data (including all fields)
        const formData = {
          name: data.listing.name || '',
          description: data.listing.description || '',
          address: data.listing.address || '',
          bedrooms: data.listing.bedrooms || 1,
          bathrooms: data.listing.bathrooms || 1,
          regularPrice: data.listing.regularPrice || 50,
          discountPrice: data.listing.discountPrice || 0,
          offer: data.listing.offer || false,
          parking: data.listing.parking || false,
          furnished: data.listing.furnished || false,
          imageUrls: data.listing.imageUrls || [],
          contactEmail: data.listing.contactEmail || '',
          contactPhone: data.listing.contactPhone || '',
          // Night-stay specific fields
          maxGuests: data.listing.maxGuests || '',
          categories: data.listing.categories || [],
          checkInTime: data.listing.checkInTime || '14:00',
          checkOutTime: data.listing.checkOutTime || '14:00',
          houseRules: data.listing.houseRules || '',
          bbqEnabled: data.listing.bbqEnabled || false,
          bbqPrice: data.listing.bbqPrice || 0,
          bbqDetails: data.listing.bbqDetails || {
            chickenKg: 0,
            muttonKg: 0,
            fishKg: 0,
            chickenPrice: 0,
            muttonPrice: 0,
            fishPrice: 0,
          },
          campfireEnabled: data.listing.campfireEnabled || false,
          campfirePrice: data.listing.campfirePrice || 0,
          soundSystemEnabled: data.listing.soundSystemEnabled || false,
          soundSystemPrice: data.listing.soundSystemPrice || 0,
        };

        setInitialData(formData);
        setFetchLoading(false);
      } catch (error) {
        showError(error.message || 'Failed to fetch listing');
        setFetchLoading(false);
      }
    };

    if (currentUser && params.listingId) {
      fetchListing();
    }
  }, [params.listingId, currentUser, showError]);

  // Night-Stay specific steps
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
      showError('Please sign in to update a listing');
      navigate('/signIn');
      return;
    }

    setLoading(true);
    try {
      // Prepare update data based on listing type
      const updateData = {
        ...wizardFormData,
        bedrooms: wizardFormData.bedrooms || 1,
        regularPrice: parseFloat(wizardFormData.regularPrice),
        discountPrice: wizardFormData.offer ? parseFloat(wizardFormData.discountPrice) : 0,
      };

      if (listingType === 'night-stay') {
        updateData.type = 'night-stay';
        updateData.listingSubType = 'night-stay';
        // Add prices and rates for night-stay
        updateData.campfirePrice = wizardFormData.campfireEnabled ? parseFloat(wizardFormData.campfirePrice) : 0;
        updateData.soundSystemPrice = wizardFormData.soundSystemEnabled ? parseFloat(wizardFormData.soundSystemPrice) : 0;
        updateData.bbqRates = wizardFormData.bbqRates;
      } else {
        updateData.type = listingType === 'sell' ? 'sale' : 'rent';
      }

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showError(data.message || 'Failed to update listing');
        return;
      }

      success('Listing updated successfully!');
      navigate(`/listing/${params.listingId}`);
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Error updating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-purple-700 mb-4">Loading Listing...</h1>
          <p className="text-purple-600">Please wait while we fetch your listing data.</p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-purple-600">Please sign in to update a listing</p>
      </main>
    );
  }

  if (!initialData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load listing data</p>
      </main>
    );
  }

  return (
    <div className="relative">
      <MultiStepWizard
        listingType={listingType}
        onSubmit={handleSubmit}
        initialData={initialData}
        additionalSteps={listingType === 'night-stay' ? nightStaySteps : []}
        isEditing={true}
      />

      {/* Floating Price Preview for night-stay - will be shown when regularPrice is set */}
      {listingType === 'night-stay' && initialData?.regularPrice && (
        <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 w-80 z-10">
          <TotalPricePreview formData={{ ...initialData, regularPrice: initialData.regularPrice || 0 }} />
        </div>
      )}
    </div>
  );
}
