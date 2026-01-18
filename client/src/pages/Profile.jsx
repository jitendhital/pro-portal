import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/uploadImage';
import { updateUserStart, updateUserSuccess, updateUserFailure, signOutStart, signOutSuccess, signOutFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListings, setShowListings] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
  });

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    setFileUploadError(null);
    dispatch(updateUserStart());
    
    try {
      if (!currentUser?._id) {
        throw new Error('User ID not found');
      }
      
      const imageUrl = await uploadImage(file, 'avatars', currentUser._id);
      
      // Update the user's avatar in the backend
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ avatar: imageUrl }),
      });

      // Handle empty or non-JSON responses
      const text = await res.text();
      let data = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid response from server');
        }
      }
      
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update avatar');
      }

      // Update Redux store with new avatar
      dispatch(updateUserSuccess(data.user));
      setFile(null);
      setFilePerc(0);
      setFileUploadError(null);
    } catch (error) {
      setFileUploadError(error.message);
      dispatch(updateUserFailure(error.message));
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
        setFileUploadError('File size must be less than 2MB');
        return;
      }
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    
    try {
      dispatch(updateUserStart());
      
      // Only send fields that have values
      const updateData = {};
      if (formData.username && formData.username !== currentUser.username) {
        updateData.username = formData.username;
      }
      if (formData.email && formData.email !== currentUser.email) {
        updateData.email = formData.email;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }

      // If no fields to update
      if (Object.keys(updateData).length === 0) {
        dispatch(updateUserFailure('No changes to update'));
        return;
      }

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const text = await res.text();
      let data = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid response from server');
        }
      }

      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.message || 'Update failed'));
        return;
      }

      dispatch(updateUserSuccess(data.user));
      setUpdateSuccess(true);
      // Clear password field after successful update
      setFormData({ ...formData, password: '' });
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
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
        dispatch(signOutFailure(data.message || 'Sign out failed'));
        return;
      }

      dispatch(signOutSuccess());
      navigate('/signIn');
    } catch (error) {
      dispatch(signOutFailure(error.message));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This will permanently delete your account and all your listings. This action cannot be undone.')) {
      return;
    }

    // Double confirmation for safety
    if (!window.confirm('This is your final warning. Are you absolutely sure?')) {
      return;
    }

    try {
      setDeletingAccount(true);
      dispatch(deleteUserStart());
      
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const text = await res.text();
      let data = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid response from server');
        }
      }

      if (!res.ok || data.success === false) {
        dispatch(deleteUserFailure(data.message || 'Delete account failed'));
        setDeletingAccount(false);
        return;
      }

      dispatch(deleteUserSuccess());
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate('/signIn');
      }, 500);
    } catch (error) {
      console.error('Error deleting account:', error);
      dispatch(deleteUserFailure(error.message || 'An error occurred while deleting your account'));
      setDeletingAccount(false);
    }
  };

  const handleShowListings = async () => {
    if (showListings) {
      setShowListings(false);
      return;
    }

    setListingsLoading(true);
    setListingsError(null);
    try {
      const res = await fetch(`/api/listing/user/${currentUser._id}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success === false) {
        setListingsError(data.message);
        setListingsLoading(false);
        return;
      }

      setUserListings(data.listings);
      setShowListings(true);
    } catch (error) {
      setListingsError(error.message);
    } finally {
      setListingsLoading(false);
    }
  };

  const handleListingDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const text = await res.text();
      let data = {};
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          setListingsError('Failed to delete listing. Please try again.');
          return;
        }
      }

      if (!res.ok || data.success === false) {
        setListingsError(data.message || 'Failed to delete listing');
        return;
      }

      // Remove the deleted listing from the list
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
      setListingsError(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      setListingsError(error.message || 'An error occurred while deleting the listing');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={handleFileChange}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          disabled={uploading}
        />
        <div className='relative self-center'>
          <img
            onClick={() => !uploading && fileRef.current?.click()}
            src={file ? URL.createObjectURL(file) : currentUser?.avatar}
            alt='profile'
            className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2 hover:opacity-80 transition-opacity'
          />
          {uploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
              <span className='text-white text-sm'>Uploading...</span>
            </div>
          )}
        </div>
        {fileUploadError && (
          <p className='text-red-600 text-center text-sm'>{fileUploadError}</p>
        )}
        {filePerc > 0 && filePerc < 100 && (
          <div className='text-center text-sm text-slate-600'>
            Uploading: {filePerc}%
          </div>
        )}
        
        <input
          type='text'
          placeholder='username'
          id='username'
          value={formData.username}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          value={formData.email}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='password'
          id='password'
          value={formData.password}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />

        <button 
          type='submit'
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </form>

      {error && (
        <p className='text-red-600 text-center mt-3'>{error}</p>
      )}
      {updateSuccess && (
        <p className='text-green-600 text-center mt-3'>Profile updated successfully!</p>
      )}
      
      <button
        onClick={() => navigate('/create-listing')}
        className='w-full bg-green-700 text-white rounded-lg p-3 uppercase hover:opacity-95 mt-4'
      >
        Create Listing
      </button>
      
      <div className='flex justify-between mt-5'>
        <span 
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          className={`text-red-700 cursor-pointer hover:underline ${deletingAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {deletingAccount ? 'Deleting...' : 'Delete account'}
        </span>
        <span 
          onClick={handleShowListings}
          className='text-green-700 cursor-pointer hover:underline'
        >
          {showListings ? 'Hide listings' : 'Show listings'}
        </span>
        <span 
          onClick={handleSignOut}
          className='text-red-700 cursor-pointer hover:underline'
        >
          Sign out
        </span>
      </div>

      {showListings && (
        <div className='mt-5'>
          <h2 className='text-2xl font-semibold mb-4'>Your listings</h2>
          {listingsLoading && <p className='text-center text-slate-600'>Loading listings...</p>}
          {listingsError && <p className='text-red-600 text-center'>{listingsError}</p>}
          {!listingsLoading && !listingsError && userListings.length === 0 && (
            <p className='text-center text-slate-600'>You have no listings yet.</p>
          )}
          {!listingsLoading && !listingsError && userListings.length > 0 && (
            <div className='flex flex-col gap-4'>
              {userListings.map((listing) => (
                <div
                  key={listing._id}
                  className='flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:shadow-lg transition-shadow'
                >
                  <div className='flex items-center gap-4 flex-1'>
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.name}
                      className='w-20 h-20 object-cover rounded-lg'
                    />
                    <p 
                      onClick={() => navigate(`/listing/${listing._id}`)}
                      className='text-slate-700 font-semibold flex-1 cursor-pointer hover:underline'
                    >
                      {listing.name}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => navigate(`/update-listing/${listing._id}`)}
                      className='text-green-700 hover:underline uppercase text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleListingDelete(listing._id)}
                      className='text-red-700 hover:underline uppercase text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
