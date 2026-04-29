import React from 'react'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      <div className='my-16 flex flex-col md:flex-row gap-16 items-center justify-center mb-32'>
        <div className='w-full md:w-1/2 relative group'>
            <img className='w-full rounded-3xl shadow-lg group-hover:scale-[1.02] transition-transform duration-500' src={assets.contact_img} alt="Contact Shopora" />
            <div className='absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10'></div>
        </div>
        <div className='flex flex-col justify-center items-start gap-8 md:w-1/2'>
          <div className='space-y-4'>
            <p className='font-bold text-2xl text-gray-800'>Our Store</p>
            <p className='text-gray-500 leading-relaxed'>54709 Willms Station <br /> Suite 350, Washington, USA </p>
            <p className='text-gray-500'>Tel: <span className='text-gray-800 font-medium'>(415) 555-0132</span> <br /> Email: <span className='text-gray-800 font-medium'>admin@shopora.com</span></p>
          </div>
          
          <div className='space-y-4 pt-4'>
            <p className='font-bold text-2xl text-gray-800'>Careers at Shopora</p>
            <p className='text-gray-500 leading-relaxed'>Join our visionary team and help us shape the future of e-commerce.</p>
            <button className='bg-white border-2 border-primary text-primary px-10 py-4 rounded-2xl text-sm font-bold hover:bg-primary hover:text-white transition-all duration-500 shadow-sm active:scale-95'>
                EXPLORE JOBS
            </button>
          </div>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default Contact;
