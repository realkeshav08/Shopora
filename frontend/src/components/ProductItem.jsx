import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, images, name, price, available }) => {
  const { currency } = useContext(ShopContext); 

  // Resilience: handle both singular 'image' and plural 'images' from different data sources
  const imagesToUse = image || images || [];
  const productImage = Array.isArray(imagesToUse) && imagesToUse.length > 0 ? imagesToUse[0] : "placeholder.jpg";

  return (
    <Link className='group text-gray-800 cursor-pointer' to={id ? `/product/${id}` : '#'}>
      <div className='relative overflow-hidden rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500'>
        <img className={`w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out ${available === false ? 'grayscale opacity-60' : ''}`} src={productImage} alt={name || "Product"} />
        
        {available === false && (
          <div className='absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg z-10'>
            OUT OF STOCK
          </div>
        )}

        <div className='absolute bottom-3 left-3 right-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500'>
          <button className='w-full py-2 bg-white/90 backdrop-blur-md text-primary text-xs font-bold rounded-lg shadow-lg border border-primary/10'>
            {available === false ? 'NOT AVAILABLE' : 'QUICK VIEW'}
          </button>
        </div>
      </div>
      <div className='px-1 pt-4 pb-2'>
        <p className='text-sm font-medium group-hover:text-primary transition-colors line-clamp-1'>{name || "No Name"}</p>
        <p className='text-primary font-bold mt-1'>{currency ? currency + price : "Price Not Available"}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
