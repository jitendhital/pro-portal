import React, { useEffect, useState } from 'react';
import { FaSearch, FaCalendarCheck } from 'react-icons/fa';
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
    <header className="bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-white">Jiten</span>
            <span className="text-emerald-200">Estate</span>
          </h1>
        </Link>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm p-2.5 rounded-xl flex items-center shadow-sm">
          <input
            type="text"
            placeholder="Search properties..."
            className="bg-transparent focus:outline-none w-24 sm:w-64 text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors">
            <FaSearch className="text-white text-sm" />
          </button>
        </form>

        {/* Navigation Links */}
        <ul className="flex gap-4 items-center">
          <Link to="/">
            <li className="hidden sm:inline text-white/90 hover:text-white transition-colors">
              Home
            </li>
          </Link>

          <Link to="/about">
            <li className="hidden sm:inline text-white/90 hover:text-white transition-colors">
              About
            </li>
          </Link>

          {/* User navigation */}
          {currentUser ? (
            <>
              <Link to='/dashboard'>
                <li className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all">
                  <FaCalendarCheck />
                  Dashboard
                </li>
              </Link>
              <Link to='/profile'>
                <img
                  className='rounded-full h-8 w-8 object-cover ring-2 ring-white/50 hover:ring-white transition-all'
                  src={currentUser.avatar}
                  alt='profile'
                />
              </Link>
            </>
          ) : (
            <Link to='/signIn'>
              <li className='px-4 py-1.5 rounded-lg bg-white text-emerald-600 font-medium hover:bg-emerald-50 transition-colors'>
                Sign in
              </li>
            </Link>
          )}
        </ul>
      </div>
    </header>
  );
}

