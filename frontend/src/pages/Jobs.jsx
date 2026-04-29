import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const Jobs = () => {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center py-20'>
      <div className='text-center mb-12'>
        <Title text1={'JOIN OUR'} text2={'TEAM'} />
        <p className='text-gray-500 mt-4 max-w-lg mx-auto'>We're always looking for talented individuals to join the Shopora family.</p>
      </div>

      <div className='bg-white/40 backdrop-blur-md rounded-[3rem] p-10 sm:p-20 border border-primary/5 shadow-sm text-center max-w-4xl w-full mx-auto'>
        <div className='mb-10'>
          <img src={assets.logo} alt="Shopora" className='w-32 mx-auto mb-8 opacity-80' />
          <h2 className='text-3xl font-bold text-gray-800 mb-6'>Current Openings</h2>
          <p className='text-gray-600 text-lg leading-relaxed mb-8'>
            At Shopora, we are building the future of e-commerce. While we don't have specific job listings posted right now, we are always eager to meet passionate people.
          </p>
          
          <div className='bg-primary/5 rounded-3xl p-8 border border-primary/10 inline-block'>
            <p className='text-xl font-semibold text-primary mb-4'>How to Apply</p>
            <p className='text-gray-700 leading-relaxed'>
                Please send your updated resume and a brief cover letter explaining why you'd like to join us to:
            </p>
            <a href="mailto:shopora@keshavkashyap.me" className='text-2xl font-bold text-gray-900 block mt-4 hover:text-primary transition-colors'>
                shopora@keshavkashyap.me
            </a>
          </div>
          
          <p className='text-gray-500 mt-10 italic'>
            "We carefully review every resume we receive and will reach out if we find a potential match for our current or future needs."
          </p>
        </div>
      </div>
    </div>
  )
}

export default Jobs
