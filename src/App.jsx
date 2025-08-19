import {BrowserRouter , Routes, Route, } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/"  element={<Home />} />
      <Route path="/signIn"element={<SignIn />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/about" element={<About />}/>
      <Route path="/profile"element={<Profile />} />
      
    </Routes>
  </BrowserRouter>;
}
