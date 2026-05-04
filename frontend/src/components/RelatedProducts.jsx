import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';
import axios from 'axios';

const RelatedProducts = ({ category, subCategory, productId }) => {
  const { products, backendUrl } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!productId) return;

    const fetchSimilar = async () => {
      try {
        const res = await axios.post(backendUrl + '/api/recommendations/similar', { productId });
        if (res.data.success && res.data.products.length > 0) {
          setRelated(res.data.products);
          return;
        }
      } catch {
        // fall through to local filter
      }
      // Fallback: local category/subCategory filter
      const filtered = products
        .filter(p => p._id !== productId && p.category === category && p.subCategory === subCategory)
        .slice(0, 5);
      setRelated(filtered);
    };

    fetchSimilar();
  }, [productId, products, category, subCategory, backendUrl]);

  if (related.length === 0) return null;

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={'SIMILAR'} text2={'PRODUCTS'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6">
        {related.slice(0, 5).map((item, index) => (
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

export default RelatedProducts;
