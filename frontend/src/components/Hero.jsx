import React from 'react' 
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom';

const Hero = () => { 
    return ( 
        <div className='flex flex-col sm:flex-row bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm border border-primary/10'> 
            {/* Hero Left Side */} 
            <div className='w-full sm:w-1/2 flex items-center justify-center py-16 sm:py-0 px-8 sm:px-16'> 
                <div className='text-gray-800'> 
                    <div className='flex items-center gap-2 mb-4'> 
                        <span className='px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full tracking-widest uppercase'>Trending Now</span>
                    </div> 
                    <h1 className='prata-regular text-4xl sm:py-4 lg:text-6xl leading-tight mb-4'>Elevate Your Style <br/> with Shopora</h1>
                    <div className='flex items-center gap-4 mt-6'>
                        <Link to='/collection'>
                            <button className='bg-primary text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-secondary transition-all shadow-md shadow-primary/20'>
                                Explore Collections
                            </button>
                        </Link>
                        <a href='#latest-collection' className='flex items-center gap-2 group cursor-pointer'>
                            <p className='font-semibold text-sm group-hover:text-primary transition-colors'>LATEST ARRIVALS</p>
                            <div className='w-8 h-[2px] bg-primary group-hover:w-12 transition-all'></div>
                        </a>
                    </div>
                </div> 
            </div> 
            {/* Hero Right Side */}
            <div className='w-full sm:w-1/2 relative group'>
                <img className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' src={assets.hero_img} alt="Featured Arrival" />
                <div className='absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none'></div>
            </div>
        </div> 
    ) 
} 
export default Hero