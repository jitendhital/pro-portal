import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    // Header container with a light gray-blue background and a subtle shadow
    <header className="bg-slate-200 shadow-md">
      {/* Inner div to control spacing and alignment */}
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Jiten</span>
            <span className="text-slate-700">Portal</span>
          </h1>
        </Link>
        
        {/* Search Form */}
        <form className="bg-slate-100 p-3 rounded-lg flex items-center">
          <input
            type="text"
            placeholder="Search..."
            // The input field is wider on larger screens (sm:) and has no focus outline
            className="bg-transparent focus:outline-none w-24 sm:w-64"
          />
          <FaSearch className="text-slate-600" />
        </form>
        
        {/* Navigation Links */}
        <ul className="flex gap-4">
          {/* These links are hidden on mobile (hidden) and shown on screens larger than 'sm' */}
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>

          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>

          {/* The "Sign In" and "Sign Up" links are always visible */} 
          <Link to="/signIn"> 
            <li className="text-slate-700 hover:underline">
              Sign In
            </li>
          </Link>
          
        </ul>
      </div>
    </header>
  );
}
