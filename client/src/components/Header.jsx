import React, { useEffect, useState } from 'react';
import { FaSearch, FaSun, FaMoon } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/signIn', '/signUp'].includes(location.pathname);
  const { theme, toggleTheme } = useTheme();

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
    // Header container
    <header className="sticky top-0 z-50 bg-purple-100 dark:bg-slate-900 shadow-md dark:shadow-slate-700/30 transition-colors duration-300">
      {/* Inner div to control spacing and alignment */}
      <div className={`flex items-center max-w-6xl mx-auto p-3 ${isAuthPage ? 'justify-center' : 'justify-between'}`}>
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-purple-500 dark:text-purple-400">Home</span>
            <span className="text-purple-700 dark:text-purple-300">Hive</span>
          </h1>
        </Link>

        {/* Search Form */}
        {!isAuthPage && (
          <form onSubmit={handleSubmit} className="bg-purple-50 dark:bg-slate-800 p-3 rounded-lg flex items-center border border-purple-200 dark:border-slate-600 transition-colors duration-300">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent focus:outline-none w-24 sm:w-64 placeholder-purple-300 dark:placeholder-slate-500 dark:text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <FaSearch className="text-purple-600 dark:text-purple-400" />
            </button>
          </form>
        )}

        {/* Navigation Links */}
        {!isAuthPage && (
          <ul className="flex gap-4 items-center">
            <Link to="/">
              <li className="hidden sm:inline text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline transition-colors font-medium">
                Home
              </li>
            </Link>

            <Link to="/about">
              <li className="hidden sm:inline text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline transition-colors font-medium">
                About
              </li>
            </Link>

            {currentUser && (
              <Link to="/dashboard">
                <li className="hidden sm:inline text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors font-medium">
                  Dashboard
                </li>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-purple-200 dark:hover:bg-slate-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FaSun className="text-yellow-400 text-lg" />
              ) : (
                <FaMoon className="text-purple-700 text-lg" />
              )}
            </button>

            {currentUser ? (
              <Link to='/profile'>
                <img
                  className='rounded-full h-7 w-7 object-cover border-2 border-purple-300 dark:border-purple-500 hover:border-purple-500 dark:hover:border-purple-300 transition-colors'
                  src={currentUser.avatar}
                  alt='profile'
                />
              </Link>
            ) : (
              <Link to='/signIn'>
                <li className='text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:underline transition-colors font-medium'>Sign in</li>
              </Link>
            )}
          </ul>
        )}
      </div>
    </header>
  );
}
