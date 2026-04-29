import React from 'react'
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2 = {'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16 items-center'>
        <div className='w-full md:w-1/2 relative group'>
            <img className='w-full rounded-3xl shadow-lg group-hover:scale-[1.02] transition-transform duration-500' src={assets.about_img} alt="About Shopora" />
            <div className='absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10'></div>
        </div>
        <div className='flex flex-col justify-center gap-6 md:w-1/2 text-gray-600 leading-relaxed'>
          <p>Shopora was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.</p>
          <p>Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.</p>
          <b className='text-gray-800 text-xl'>Our Mission</b>
          <p>Our mission at Shopora is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.</p>
        </div>
      </div>
      <div className='text-xl py-12'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 mb-20 gap-px bg-primary/5 rounded-3xl overflow-hidden border border-primary/5 shadow-sm'>
        <div className='bg-white/60 backdrop-blur-sm px-10 md:px-16 py-12 flex flex-col gap-5 hover:bg-white transition-colors'>
          <b className='text-gray-800 text-lg'>Quality Assurance</b>
          <p className='text-gray-500'>We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
        </div>
        <div className='bg-white/60 backdrop-blur-sm px-10 md:px-16 py-12 flex flex-col gap-5 hover:bg-white transition-colors'>
          <b className='text-gray-800 text-lg'>Convenience</b>
          <p className='text-gray-500'>With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
        </div>
        <div className='bg-white/60 backdrop-blur-sm px-10 md:px-16 py-12 flex flex-col gap-5 hover:bg-white transition-colors'>
          <b className='text-gray-800 text-lg'>Exceptional Service</b>
          <p className='text-gray-500'>Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction.</p>
        </div>
      </div>
      <NewsletterBox/>
    </div>
  )
}

export default About;
