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
          <NavLink className='flex items-center gap-3 border border-primary/10 border-r-0 px-3 py-2 rounded-l transition-colors' to='/users'>
              <svg className='w-5 h-5 opacity-70' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 100-6' />
              </svg>
              <p className='md:block text-gray-700 font-medium'>Users</p>
          </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
