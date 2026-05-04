import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, backendUrl } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [youMightLike, setYouMightLike] = useState([]);

  useEffect(()=>{
    if(products.length > 0){
      const tempData = [];
    for(const items in cartItems){
      for(const item in cartItems[items]){
        if(cartItems[items][item] > 0){
          tempData.push({
            _id: items,
            size : item,
            quantity: cartItems[items][item]
          })
        }
      }
    }
    setCartData(tempData);
    }
  }, [cartItems, products])

  // Fetch "You Might Also Like" based on first cart item's similar products
  useEffect(() => {
    const cartIds = Object.keys(cartItems).filter(id => {
      return Object.values(cartItems[id] || {}).some(qty => qty > 0);
    });

    if (cartIds.length === 0) {
      setYouMightLike([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await axios.post(backendUrl + '/api/recommendations/similar', { productId: cartIds[0] });
        if (res.data.success && res.data.products.length > 0) {
          // Exclude items already in cart
          const cartSet = new Set(cartIds);
          setYouMightLike(res.data.products.filter(p => !cartSet.has(p._id)).slice(0, 4));
        }
      } catch {
        // silently skip
      }
    };

    fetchSuggestions();
  }, [cartItems, backendUrl]);
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2 = {'CART'}/>
      </div>
      <div>
        {cartData.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 gap-6'>
            <div className='bg-primary/5 p-8 rounded-full'>
              <img src={assets.cart_icon} className='w-16 opacity-30' alt="" />
            </div>
            <div className='text-center'>
              <p className='text-xl font-medium text-gray-800'>Your cart feels a bit light!</p>
              <p className='text-gray-500 mt-2'>Explore our collections and find something you love.</p>
            </div>
            <button 
              onClick={() => navigate('/collection')} 
              className='bg-primary text-white px-10 py-3 rounded-2xl font-bold hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/20'
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <>
            {cartData.map((item, index) => {
              const productData = products.find((product)=> product._id === item._id);
              
              if (!productData) {
                return null; // Skip if product not found in database
              }

              return (
                <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    <img src={productData.image[0]} className='w-16 sm:w-20' alt="" />
                    <div>
                      <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{productData.price}</p>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-light'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input onChange={(e)=> e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min='1' defaultValue={item.quantity} />
                  <img onClick={()=> updateQuantity(item._id, item.size, 0)} src={assets.bin_icon} className='w-4 mr-4 sm:w-5 cursor-pointer' alt="" />
                </div>
              )
            })}
            <div className='flex justify-end my-20'>
              <div className='w-full sm:w-[450px]'>
                <CartTotal/>
                <div className='w-full text-end'>
                  <button onClick={()=> navigate('/place-order')} className='bg-primary text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {youMightLike.length > 0 && (
        <div className="mt-16 border-t pt-12">
          <div className="text-center mb-8">
            <Title text1={'YOU MIGHT'} text2={'ALSO LIKE'} />
            <p className="text-sm text-gray-400 -mt-4">Items that go well with your cart</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6">
            {youMightLike.map((item, index) => (
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
      )}
    </div>
  )
}

export default Cart;
