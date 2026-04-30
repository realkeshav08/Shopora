import React from 'react'
import {assets} from '../assets/assets'

const NavBar = ({ setToken }) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between bg-[#fff1f6] border-b border-primary/10'>
      <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
      <button onClick={() => setToken('')} className='bg-primary text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all'>
        Logout
      </button>
    </div>
  )
}

export default NavBar
