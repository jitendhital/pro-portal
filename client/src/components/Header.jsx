import React, { useEffect, useState } from 'react';
import { FaSearch, FaThLarge } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    // Header container with a purple-tinted background and a subtle shadow
    <header className="bg-purple-100 shadow-md">
      {/* Inner div to control spacing and alignment */}
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-purple-500">Jiten</span>
            <span className="text-purple-700">Estate</span>
          </h1>
        </Link>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-purple-50 p-3 rounded-lg flex items-center border border-purple-200">
          <input
            type="text"
            placeholder="Search..."
            // The input field is wider on larger screens (sm:) and has no focus outline
            className="bg-transparent focus:outline-none w-24 sm:w-64 placeholder-purple-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">
            <FaSearch className="text-purple-600" />
          </button>
        </form>
        
        {/* Navigation Links */}
        <ul className="flex gap-4">
          {/* These links are hidden on mobile (hidden) and shown on screens larger than 'sm' */}
          <Link to="/">
            <li className="hidden sm:inline text-purple-700 hover:text-purple-900 hover:underline transition-colors font-medium">
              Home
            </li>
          </Link>

          <Link to="/about">
            <li className="hidden sm:inline text-purple-700 hover:text-purple-900 hover:underline transition-colors font-medium">
              About
            </li>
          </Link>

          {currentUser && (
            <Link to="/dashboard">
              <li className="hidden sm:inline text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors font-medium">
                <FaThLarge className="text-purple-600" />
                Dashboard
              </li>
            </Link>
          )}

          {/* The "Sign In" and "Sign Up" links are always visible */} 
           {currentUser ? (
            <Link to='/profile'>
              <img
                className='rounded-full h-7 w-7 object-cover border-2 border-purple-300 hover:border-purple-500 transition-colors'
                src={currentUser.avatar}
                alt='profile'
              />
            </Link>
          ) : (
            <Link to='/signIn'>
              <li className=' text-purple-700 hover:text-purple-900 hover:underline transition-colors font-medium'> Sign in</li>
            </Link>
          )}
          
        </ul>
      </div>
    </header>
  );
}
