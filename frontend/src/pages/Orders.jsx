import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';


const Orders = () => {
  const {backendUrl, token, currency} = useContext(ShopContext);

  const [orders, setOrders] = useState([]);

  const loadOrderData = async () => {
    try{
      if(!token){
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userOrders', {}, {headers: {token}})
      if(response.data.success){
        // We keep the order structure instead of flattening it
        setOrders(response.data.orders.reverse());
      }
    }
    catch(error){
      console.error(error);
    }
  }

  useEffect(()=>{
    loadOrderData()
  }, [token])

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-6'>
        <Title text1 = {'MY'} text2 = {'ORDERS'}/>
      </div>
      <div className='flex flex-col gap-6'>
        {orders.map((order, index) => (
          <div key={index} className='border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'>
            {/* Order Header */}
            <div className='bg-gray-50/50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4'>
               <div className='flex gap-6 text-sm'>
                  <div>
                    <p className='text-gray-500 uppercase text-[10px] font-bold'>Order Date</p>
                    <p className='font-medium'>{new Date(order.date).toDateString()}</p>
                  </div>
                  <div>
                    <p className='text-gray-500 uppercase text-[10px] font-bold'>Order ID</p>
                    <p className='font-medium text-primary'>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className='text-gray-500 uppercase text-[10px] font-bold'>Total Amount</p>
                    <p className='font-bold text-gray-900'>{currency}{order.amount}</p>
                  </div>
               </div>
               <div className='flex items-center gap-2 px-3 py-1 bg-white border rounded-full shadow-sm'>
                 <p className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></p>
                 <p className='text-xs font-bold text-gray-700'>{order.status}</p>
               </div>
            </div>

            {/* Order Items */}
            <div className='px-6 divide-y'>
              {order.items.map((item, idx) => (
                <div key={idx} className='py-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  <div className='flex items-start gap-6'>
                    <img className='w-20 rounded-lg object-cover border' src={item.image[0]} alt={item.name} />
                    <div className='flex flex-col gap-1'>
                      <p className='sm:text-lg font-bold text-gray-900'>{item.name}</p>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <p className='font-medium'>{currency}{item.price}</p>
                        <span className='text-gray-300'>|</span>
                        <p>Quantity: <span className='font-medium'>{item.quantity}</span></p>
                        <span className='text-gray-300'>|</span>
                        <p>Size: <span className='font-medium'>{item.size}</span></p>
                      </div>
                      <p className='text-xs text-gray-400 mt-1'>Payment: {order.paymentMethod}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.info("Order tracking is currently being updated.")} 
                    className='border border-primary/20 bg-white hover:bg-primary/5 text-primary px-6 py-2.5 text-sm font-bold rounded-xl transition-all'
                  >
                    Track Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders;
