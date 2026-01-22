import {BrowserRouter , Routes, Route, } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import CreateListing from './pages/CreateListing';
import CreateSellListing from './pages/CreateSellListing';
import CreateRentListing from './pages/CreateRentListing';
import CreateNightStayListing from './pages/CreateNightStayListing';
import ListingTypeSelector from './pages/ListingTypeSelector';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import EnhancedSearch from './pages/EnhancedSearch';
import BookingSummary from './pages/BookingSummary';
import SellerBookings from './pages/SellerBookings';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute.jsx';

export default function App() {
  return <BrowserRouter>
  <Header />
    <Routes>
      <Route path="/"  element={<Home />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/about" element={<About />}/>
      <Route path="/search" element={<EnhancedSearch />} />
      <Route path="/search-old" element={<Search />} />
      <Route path="/listing/:listingId" element={<Listing />} />
      <Route path="/booking/:bookingId" element={<BookingSummary />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create" element={<ListingTypeSelector />} />
        <Route path="/create/sell" element={<CreateSellListing />} />
        <Route path="/create/rent" element={<CreateRentListing />} />
        <Route path="/create/night-stay" element={<CreateNightStayListing />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/update-listing/:listingId" element={<UpdateListing />} />
        <Route path="/bookings" element={<SellerBookings />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>
    </Routes>
  </BrowserRouter>;
}
