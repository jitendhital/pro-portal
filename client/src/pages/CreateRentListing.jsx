import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import MultiStepWizard from '../components/MultiStepWizard';
import { useToast } from '../contexts/ToastContext';

/**
 * Create Rent Listing Page
 * Uses the MultiStepWizard component for rent-type listings
 */
export default function CreateRentListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem('listing-draft-rent');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setInitialData(draftData);
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, []);

  const handleSubmit = async (formData) => {
    if (!currentUser) {
      showError('Please sign in to create a listing');
      navigate('/signIn');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        ...formData,
        type: 'rent',
        bedrooms: formData.bedrooms || 1,
        regularPrice: parseFloat(formData.regularPrice),
        discountPrice: formData.offer ? parseFloat(formData.discountPrice) : 0,
        userRef: currentUser._id,
      };

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        showError(data.message || 'Failed to create listing');
        return;
      }

      // Clear draft
      localStorage.removeItem('listing-draft-rent');
      success('Listing created successfully!');
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
    <MultiStepWizard
      listingType="rent"
      onSubmit={handleSubmit}
      initialData={initialData}
      additionalSteps={[]}
    />
  );
}

