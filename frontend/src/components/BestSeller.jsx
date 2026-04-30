import React, {useContext, useEffect, useState} from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const {products} = useContext (ShopContext); 
    const [bestSeller, setBestSeller] = useState([]); 
    useEffect(()=>{ 
        const bestProduct = products.filter((item)=>(item.bestseller)); 
        setBestSeller (bestProduct.slice(0,5)) 
    }, [products]) 
  return (
    <div className='my-20 bg-primary/5 rounded-[3rem] py-16 px-8'>
      <div className='py-8'>
        <Title text1={'TOP RATED'} text2={'Best Sellers'}/>
        <p className='w-full max-w-2xl m-auto text-sm md:text-base text-gray-500 text-center leading-relaxed'>
          Discover our most-loved pieces, chosen by our community for their exceptional quality and standout design.
        </p>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 gap-y-10'>
        {bestSeller.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} available={item.available} />
        ))}
      </div>
    </div>
  )
}

export default BestSeller
