import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 py-20 px-4'>
        <div className='flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-primary/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500'>
            <div className='w-16 h-16 flex items-center justify-center bg-primary/5 rounded-2xl mb-6'>
                <img src={assets.exchange_icon} className='w-8' alt="Exchange" />
            </div>
            <p className='text-lg font-bold text-gray-800 mb-2'>Easy Exchange</p>
            <p className='text-gray-500 text-sm'>Hassle-free exchange policy for a worry-free shopping experience.</p>
        </div>
        <div className='flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-primary/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500'>
            <div className='w-16 h-16 flex items-center justify-center bg-primary/5 rounded-2xl mb-6'>
                <img src={assets.quality_icon} className='w-8' alt="Return" />
            </div>
            <p className='text-lg font-bold text-gray-800 mb-2'>7 Days Return</p>
            <p className='text-gray-500 text-sm'>Changed your mind? We provide a flexible 7-day free return policy.</p>
        </div>
        <div className='flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-primary/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-500'>
            <div className='w-16 h-16 flex items-center justify-center bg-primary/5 rounded-2xl mb-6'>
                <img src={assets.support_img} className='w-8' alt="Support" />
            </div>
            <p className='text-lg font-bold text-gray-800 mb-2'>Best Support</p>
            <p className='text-gray-500 text-sm'>Our dedicated team is here to help you 24/7 with any inquiries.</p>
        </div>
    </div>
  )
}

export default OurPolicy
