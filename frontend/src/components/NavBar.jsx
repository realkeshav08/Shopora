import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Logo from './Logo';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const { setShowSearch, getCartCount, navigate, token, setToken } = useContext(ShopContext);

    const logout = () => {
      navigate('/login')
      localStorage.removeItem('token')
      setToken('')
      // Note: the cart is intentionally NOT cleared — it stays in localStorage
      // so it persists across logout (and back through a later login).
    }

    // Styling for the mobile menu links, with an active-route highlight.
    const mobileLinkClass = ({ isActive }) =>
      `py-3 px-6 border-b border-primary/5 text-sm transition-colors ${
        isActive ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700 hover:bg-primary/5'
      }`

  return (
    <div className="sticky top-0 z-50 bg-[#fff1f6]/80 backdrop-blur-lg border-b border-primary/10">
      {/* Top bar */}
      <div className="flex items-center justify-between py-5 px-6 sm:px-12 font-medium">
        {/* Logo */}
        <Link to='/'><Logo /></Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
          <li>
            <NavLink to="/" className="group flex flex-col items-center gap-1">
              <p>HOME</p>
              <hr className="w-2/4 border-none h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/collection" className="group flex flex-col items-center gap-1">
              <p>COLLECTION</p>
              <hr className="w-2/4 border-none h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className="group flex flex-col items-center gap-1">
              <p>ABOUT</p>
              <hr className="w-2/4 border-none h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className="group flex flex-col items-center gap-1">
              <p>CONTACT</p>
              <hr className="w-2/4 border-none h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </NavLink>
          </li>
        </ul>

        {/* Profile, Cart and Hamburger */}
        <div className="flex items-center gap-6">
          <img onClick={() => { setShowSearch(true); navigate('/collection'); }} src={assets.search_icon} className="w-5 cursor-pointer" alt="Search" />

          <div className="group relative">
            <img onClick={() => token ? null : navigate('/login')} className="w-5 cursor-pointer" src={assets.profile_icon} alt="Profile" />
            {token && <div className="hidden group-hover:block absolute right-0 pt-4 bg-transparent">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white shadow-xl rounded-2xl text-gray-500 border border-primary/5">
                <p onClick={() => window.open('/profile', '_blank')} className="cursor-pointer hover:text-primary transition-colors">My Profile</p>
                <p onClick={() => navigate('/orders')} className="cursor-pointer hover:text-primary transition-colors">Orders</p>
                <p onClick={logout} className="cursor-pointer hover:text-primary transition-colors">Logout</p>
              </div>
            </div>}
          </div>

          <Link to="/cart" className="relative">
            <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-primary text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </p>
          </Link>

          {/* Hamburger — toggles the inline mobile menu */}
          <img
            onClick={() => setVisible(!visible)}
            src={assets.menu_icon}
            className='w-5 cursor-pointer sm:hidden'
            alt="Menu"
          />
        </div>
      </div>

      {/* Mobile menu — an inline vertical list. Because it sits in normal flow
          inside the navbar, opening it pushes the hero/page content down. */}
      {visible && (
        <div className="sm:hidden flex flex-col bg-white border-t border-primary/10">
          <NavLink onClick={() => setVisible(false)} to="/" className={mobileLinkClass}>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} to="/collection" className={mobileLinkClass}>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} to="/about" className={mobileLinkClass}>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} to="/contact" className={mobileLinkClass}>CONTACT</NavLink>
        </div>
      )}
    </div>
  );
};

export default NavBar;
