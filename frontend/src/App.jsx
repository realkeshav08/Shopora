import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Collection from './pages/Collection'; 
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';


const App = () => {
  const location = useLocation();

  // Branded loading window shown once per page load/reload:
  // 'loading' (1s solid) -> 'fading' (0.5s fade-out) -> 'done' (removed).
  const [splash, setSplash] = useState('loading');
  useEffect(() => {
    const t1 = setTimeout(() => setSplash('fading'), 1000);
    const t2 = setTimeout(() => setSplash('done'), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {splash !== 'done' && <SplashScreen fading={splash === 'fading'} />}
      <ScrollToTop/>
      <ToastContainer/>
      <NavBar />
      <SearchBar/>
      {/* Keyed by path so each page/section change (and reload) replays a
          smooth fade-in. NavBar/Footer stay fixed and don't re-animate. */}
      <div key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
      <Footer/>
    </div>
  );
};

export default App;
