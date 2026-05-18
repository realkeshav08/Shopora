import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, images, name, price, available }) => {
  const { currency, cartItems, updateQuantity } = useContext(ShopContext);

  // Resilience: handle both singular 'image' and plural 'images' from different data sources
  const imagesToUse = image || images || [];
  const productImage = Array.isArray(imagesToUse) && imagesToUse.length > 0 ? imagesToUse[0] : "placeholder.jpg";

  // Cart state for this product (cart is keyed by productId -> size -> quantity).
  const cartEntry = cartItems?.[id] || {};
  const sizesInCart = Object.keys(cartEntry).filter((s) => cartEntry[s] > 0);
  const totalQty = sizesInCart.reduce((sum, s) => sum + cartEntry[s], 0);
  const inCart = totalQty > 0;
  // +/- operate on the first size in the cart for this product.
  const activeSize = sizesInCart[0];

  // Stepper buttons live inside a <Link>; stop the click from navigating.
  const changeQty = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeSize) {
      updateQuantity(id, activeSize, cartEntry[activeSize] + delta);
    }
  };

  return (
    <Link className='group text-gray-800 cursor-pointer' to={id ? `/product/${id}` : '#'}>
      <div className='relative overflow-hidden rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500'>
        <img className={`w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out ${available === false ? 'grayscale opacity-60' : ''}`} src={productImage} alt={name || "Product"} />

        {available === false && (
          <div className='absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg z-10'>
            OUT OF STOCK
          </div>
        )}

        {available === false ? (
          <div className='absolute bottom-3 left-3 right-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500'>
            <button className='w-full py-2 bg-white/90 backdrop-blur-md text-primary text-xs font-bold rounded-lg shadow-lg border border-primary/10'>
              NOT AVAILABLE
            </button>
          </div>
        ) : inCart ? (
          // Product is in the cart: show an always-visible quantity stepper.
          <div className='absolute bottom-3 left-3 right-3'>
            <div className='flex items-center justify-between bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-primary/10 overflow-hidden'>
              <button
                onClick={(e) => changeQty(e, -1)}
                className='px-4 py-2 text-primary text-base font-bold hover:bg-primary/10 active:bg-primary/20 transition-colors'
                aria-label='Decrease quantity'
              >
                −
              </button>
              <span className='text-sm font-bold text-gray-900 select-none'>{totalQty}</span>
              <button
                onClick={(e) => changeQty(e, 1)}
                className='px-4 py-2 text-primary text-base font-bold hover:bg-primary/10 active:bg-primary/20 transition-colors'
                aria-label='Increase quantity'
              >
                +
              </button>
            </div>
          </div>
        ) : (
          // Not in cart: show "Quick View" on hover.
          <div className='absolute bottom-3 left-3 right-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-500'>
            <button className='w-full py-2 bg-white/90 backdrop-blur-md text-primary text-xs font-bold rounded-lg shadow-lg border border-primary/10'>
              QUICK VIEW
            </button>
          </div>
        )}
      </div>
      <div className='px-1 pt-4 pb-2'>
        <p className='text-sm font-medium group-hover:text-primary transition-colors line-clamp-1'>{name || "No Name"}</p>
        <p className='text-primary font-bold mt-1'>{currency ? currency + price : "Price Not Available"}</p>
      </div>
    </Link>
  );
};

export default ProductItem;
