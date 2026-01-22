import { useState } from 'react';
import { FaShare, FaCheck } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

/**
 * Share Button Component
 * Allows users to share listing links
 */
export default function ShareButton({ listingId, listingName }) {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/listing/${listingId}`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: listingName,
          text: `Check out this property: ${listingName}`,
          url: url,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
      }
    }
    
    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-purple-600 hover:text-purple-700 transition-colors"
      aria-label="Share listing"
      title="Share listing"
    >
      {copied ? (
        <FaCheck className="text-xl text-green-600" />
      ) : (
        <FaShare className="text-xl" />
      )}
    </button>
  );
}

