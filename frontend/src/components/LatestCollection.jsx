import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext); // Only accessing the necessary value
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]); // Ensure that you re-fetch products if they change

  return (
    <div id='latest-collection' className='my-20'>
      <div className='py-12'>
        <Title text1={'CURATED'} text2={'Latest Collections'} />
        <p className='w-full max-w-2xl m-auto text-sm md:text-base text-gray-500 text-center leading-relaxed'>
          Explore our newest arrivals, carefully selected to bring you the perfect blend of contemporary style and timeless elegance.
        </p>
      </div>
      {/* Rendering products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 gap-y-10'>
        {latestProducts.map((item, index) => (
          <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} available={item.available} />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
