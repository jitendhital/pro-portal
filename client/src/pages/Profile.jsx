import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uploadImage } from '../utils/uploadImage';
import { updateUserStart, updateUserSuccess, updateUserFailure } from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
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
          className='border p-3 rounded-lg'
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='password'
          id='password'
          className='border p-3 rounded-lg'
        />

        <button 
          type='submit'
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          Update
        </button>
      </form>
      
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>
          Delete account
        </span>
        <span className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
    </div>
  );
}
