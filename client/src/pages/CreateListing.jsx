import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { uploadImage } from '../utils/uploadImage';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const handleChange = (e) => {
    if (e.target.id === 'sell' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    } else if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setImageUploadError('Please select at least one image');
      return;
    }

    if (files.length > 6) {
      setImageUploadError('You can only upload up to 6 images');
      return;
    }

    if (imageUrls.length + files.length > 6) {
      setImageUploadError('Total images cannot exceed 6');
      return;
    }

    setUploading(true);
    setImageUploadError(null);

    try {
      const uploadPromises = files.map((file) => 
        uploadImage(file, 'listings', currentUser._id)
      );

      const urls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...urls]);
      setFiles([]);
      setImageUploadError(null);
    } catch (error) {
      setImageUploadError('Image upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (formData.regularPrice <= 0) {
      setError('Regular price must be greater than 0');
      return;
    }

    if (formData.offer && formData.discountPrice >= formData.regularPrice) {
      setError('Discount price must be less than regular price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const listingData = {
        ...formData,
        imageUrls,
        regularPrice: parseFloat(formData.regularPrice),
        discountPrice: parseFloat(formData.discountPrice),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
      };

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(listingData),
      });

      const text = await res.text();
      let data = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
        }
      }

      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to create listing');
        setLoading(false);
        return;
      }

      navigate('/');
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            maxLength='62'
            minLength='10'
            required
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            required
            value={formData.address}
            onChange={handleChange}
          />
          
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sell'
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'sell'}
              />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                value={formData.bedrooms}
                onChange={handleChange}
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                value={formData.bathrooms}
                onChange={handleChange}
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                min='0'
                required
                className='p-3 border border-gray-300 rounded-lg'
                value={formData.regularPrice}
                onChange={handleChange}
              />
              <p>Regular price ($/month)</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='discountPrice'
                min='0'
                required={formData.offer}
                disabled={!formData.offer}
                className='p-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
                value={formData.discountPrice}
                onChange={handleChange}
              />
              <p>Discounted price ($/month)</p>
            </div>
          </div>
        </div>
        
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              onChange={(e) => setFiles(e.target.files)}
              className='p-3 border border-gray-300 rounded w-full'
              type='file'
              id='images'
              accept='image/*'
              multiple
              disabled={uploading || imageUrls.length >= 6}
            />
            <button
              type='button'
              disabled={uploading || files.length === 0 || imageUrls.length >= 6}
              onClick={handleImageSubmit}
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {imageUploadError && (
            <p className='text-red-700 text-sm'>{imageUploadError}</p>
          )}
          
          {imageUrls.length > 0 && (
            <div className='flex flex-wrap gap-4'>
              {imageUrls.map((url, index) => (
                <div key={url} className='relative'>
                  <img
                    src={url}
                    alt={`listing ${index + 1}`}
                    className='w-20 h-20 object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(index)}
                    className='absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            disabled={loading || uploading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}

