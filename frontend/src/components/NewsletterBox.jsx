import React from 'react'

const NewsletterBox = () => {
    const onSubmitHandler=(event)=>{
        event.preventDefault()
    }
  return (
    <div className='bg-white/40 backdrop-blur-md rounded-3xl p-10 sm:p-20 border border-primary/5 shadow-sm text-center'>
        <p className='text-3xl font-semibold text-gray-800 mb-2'>Stay in the Loop</p>
        <p className='text-gray-500 mb-8 max-w-lg mx-auto'>Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and style tips.</p>
        <form onSubmit={onSubmitHandler} className='w-full sm:w-2/3 lg:w-1/2 flex flex-col sm:flex-row items-center gap-4 mx-auto'>
            <div className='relative w-full group'>
                <input className='w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all' type="email" placeholder='Enter your email address' required/>
            </div>
            <button className='w-full sm:w-auto whitespace-nowrap bg-primary text-white text-sm font-bold px-10 py-4 rounded-2xl hover:bg-secondary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95' type='submit'>
                JOIN NOW
            </button>
        </form>
    </div>
  )
}

export default NewsletterBox;
