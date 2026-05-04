import React from 'react'
import { NavLink } from 'react-router-dom'
import {assets} from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r border-primary/10 bg-[#fff1f6]/50'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
          <NavLink className='flex items-center gap-3 border border-primary/10 border-r-0 px-3 py-2 rounded-l transition-colors' to='/add'>
              <img className='w-5 h-5 opacity-70' src={assets.add_icon} alt="" />
              <p className='md:block text-gray-700 font-medium'>Add Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-primary/10 border-r-0 px-3 py-2 rounded-l transition-colors' to='/list'>
              <img className='w-5 h-5 opacity-70' src={assets.order_icon} alt="" />
              <p className='md:block text-gray-700 font-medium'>List Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-primary/10 border-r-0 px-3 py-2 rounded-l transition-colors' to='/order'>
              <img className='w-5 h-5 opacity-70' src={assets.order_icon} alt="" />
              <p className='md:block text-gray-700 font-medium'>Order Items</p>
          </NavLink>
          <NavLink className='flex items-center gap-3 border border-primary/10 border-r-0 px-3 py-2 rounded-l transition-colors' to='/insights'>
              <img className='w-5 h-5 opacity-70' src={assets.order_icon} alt="" />
              <p className='md:block text-gray-700 font-medium'>Insights</p>
          </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
