import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';
import axios from 'axios';

const RecommendationSection = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [recommended, setRecommended] = useState([]);
  const [type, setType] = useState('personalized');

  useEffect(() => {
    if (!token) return;

    const fetchPersonalized = async () => {
      try {
        const res = await axios.post(
          backendUrl + '/api/recommendations/personalized',
          {},
          { headers: { token } }
        );
        if (res.data.success && res.data.products.length > 0) {
          setRecommended(res.data.products);
          setType(res.data.type || 'personalized');
        }
      } catch {
        // silently skip
      }
    };

    fetchPersonalized();
  }, [token, backendUrl]);

  if (!token || recommended.length === 0) return null;

  return (
    <div className="my-16">
      <div className="text-center py-8">
        <Title
          text1={type === 'popular' ? 'POPULAR' : 'PICKED'}
          text2={type === 'popular' ? 'PICKS' : 'FOR YOU'}
        />
        <p className="text-sm text-gray-400 -mt-4 mb-4">
          {type === 'popular' ? 'Our most loved products' : 'Based on your shopping history'}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {recommended.slice(0, 5).map((item, index) => (
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

export default RecommendationSection;
