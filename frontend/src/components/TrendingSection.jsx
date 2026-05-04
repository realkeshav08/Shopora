import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';
import axios from 'axios';

const TrendingSection = () => {
  const { backendUrl } = useContext(ShopContext);
  const [trending, setTrending] = useState([]);
  const [type, setType] = useState('trending');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/recommendations/trending');
        if (res.data.success && res.data.products.length > 0) {
          setTrending(res.data.products);
          setType(res.data.type || 'trending');
        }
      } catch {
        // silently skip
      }
    };

    fetchTrending();
  }, [backendUrl]);

  if (trending.length === 0) return null;

  return (
    <div className="my-16">
      <div className="text-center py-8">
        <Title
          text1={type === 'new' ? 'NEWLY' : 'TRENDING'}
          text2={type === 'new' ? 'ARRIVED' : 'NOW'}
        />
        <p className="text-sm text-gray-400 -mt-4 mb-4">
          {type === 'new' ? 'Fresh additions to our store' : 'Most popular picks this month'}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {trending.slice(0, 5).map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
            images={item.images}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
