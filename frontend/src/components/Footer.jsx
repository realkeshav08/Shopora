import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Footer = () => {
  const { token } = useContext(ShopContext);
  const navigate = useNavigate();

  return (
    <div className='bg-[#fff1f6] rounded-t-[3rem] p-10 sm:p-20 border-t border-primary/10 shadow-inner mt-20'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 text-sm'>
        <div>
            <img src={assets.logo} className='mb-6 w-32' alt="Shopora" />
            <p className='w-full md:w-2/3 text-gray-500 leading-relaxed'>
                Shopora is your premier destination for high-quality fashion and lifestyle products. We are dedicated to providing you with the very best of curated collections, with an emphasis on quality, style, and customer satisfaction.
            </p>
        </div>
        <div>
            <p className='text-lg font-bold mb-6 text-gray-800'>COMPANY</p>
            <ul className='flex flex-col gap-3 text-gray-500'>
                <li onClick={() => { navigate('/'); window.scrollTo(0,0); }} className='hover:text-primary cursor-pointer transition-colors'>Home</li>
                <li onClick={() => { navigate('/about'); window.scrollTo(0,0); }} className='hover:text-primary cursor-pointer transition-colors'>About us</li>
                <li onClick={() => { token ? navigate('/orders') : navigate('/login'); window.scrollTo(0,0); }} className='hover:text-primary cursor-pointer transition-colors'>Delivery</li>
                <li className='hover:text-primary cursor-pointer transition-colors'>Privacy Policy</li>
            </ul>
        </div>
        <div>
            <p className='text-lg font-bold mb-6 text-gray-800'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-3 text-gray-500'>
                <li className='hover:text-primary cursor-pointer transition-colors font-medium'>+91 6378606XXX</li>
                <li>
                  <a href="mailto:shopora@keshavkashyap.me" className='hover:text-primary cursor-pointer transition-colors font-medium'>
                    shopora@keshavkashyap.me
                  </a>
                </li>
            </ul>
        </div>
      </div>
      <div>
          <hr className='border-primary/20' />
          <p className='py-5 text-sm text-center text-gray-700'>Copyright 2026 @ shopora - All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer;
