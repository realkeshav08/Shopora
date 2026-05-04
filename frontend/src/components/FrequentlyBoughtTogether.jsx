import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';
import axios from 'axios';

const FrequentlyBoughtTogether = ({ productId }) => {
  const { backendUrl } = useContext(ShopContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    const fetch = async () => {
      try {
        const res = await axios.post(backendUrl + '/api/recommendations/bought-together', { productId });
        // Only show when real co-purchase data exists (not a category fallback)
        if (res.data.success && res.data.products.length > 0 && !res.data.fallback) {
          setItems(res.data.products);
        }
      } catch {
        // silently skip — not critical
      }
    };

    fetch();
  }, [productId, backendUrl]);

  if (items.length === 0) return null;

  return (
    <div className="my-16">
      <div className="text-center py-8">
        <Title text1={'FREQUENTLY'} text2={'BOUGHT TOGETHER'} />
        <p className="text-sm text-gray-400 -mt-4 mb-4">Customers who bought this also bought</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6">
        {items.slice(0, 4).map((item, index) => (
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

export default FrequentlyBoughtTogether;
