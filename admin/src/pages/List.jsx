import axios from 'axios'
import React from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import { socket } from '../socket'

const List = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Inline-edit state for price + description.
  const [editId, setEditId] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchList = async()=>{
    try{
      const response = await axios.get(backendUrl + '/api/product/list')
      if(response.data.success){
        setList(response.data.products)
      }
      else{
        toast.error(response.data.message)
      }
    }
    catch (error){
      console.error(error)
      toast.error(error.message)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchList()
  }, [])

  // Real-time: refresh the list when any product changes (silent — fetchList
  // doesn't re-trigger the spinner, so it updates smoothly in place).
  useEffect(()=>{
    const handler = () => fetchList()
    socket.on('products:updated', handler)
    return () => socket.off('products:updated', handler)
  }, [])

  const removeProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await axios.post(
        backendUrl + '/api/product/status',
        { id, available: !currentStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id)
    setEditPrice(item.price ?? '')
    setEditDesc(item.description || '')
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditPrice('')
    setEditDesc('')
  }

  const saveEdit = async (id) => {
    if (editPrice === '' || Number(editPrice) < 0 || isNaN(Number(editPrice))) {
      toast.error('Please enter a valid price')
      return
    }
    if (!editDesc.trim()) {
      toast.error('Description cannot be empty')
      return
    }
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        backendUrl + '/api/product/edit',
        { id, price: editPrice, description: editDesc },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        cancelEdit()
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  // Toggle a single size in/out of stock (applied instantly).
  const toggleSizeStock = async (id, size, currentlyInStock) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        backendUrl + '/api/product/size-status',
        { id, size, inStock: !currentlyInStock },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Search across name, category, sub-category and description — the same
  // fields the customer storefront search uses, so results stay consistent.
  const query = search.trim().toLowerCase()
  const filteredList = query
    ? list.filter(item =>
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.subCategory?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    : list

  return (
    <>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3'>
        <p>All Products List <span className='text-gray-400'>({filteredList.length})</span></p>

        {/* Search */}
        <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 bg-white w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/20 transition-all'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type='text'
            placeholder='Search products by name, category or type...'
            className='outline-none text-sm flex-1 bg-transparent'
          />
          {search && (
            <button onClick={() => setSearch('')} className='text-gray-400 hover:text-gray-600 text-lg leading-none' aria-label='Clear search'>&times;</button>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {/*List Table Title */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Status</b>
          <b className='text-center'>Action</b>
        </div>

        {/* Product List */}
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='h-8 w-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin'></div>
          </div>
        ) : filteredList.length === 0 ? (
          <div className='py-16 text-center text-gray-500 border'>
            {query ? `No products match "${search}".` : 'No products found.'}
          </div>
        ) : (
          filteredList.map((item) => (
            editId === item._id ? (
              /* ---- Edit mode ---- */
              <div className='border bg-primary/5 p-4 text-sm' key={item._id}>
                <div className='flex items-center gap-3 mb-3'>
                  <img className='w-12' src={item.images?.[0] || 'default-image-url'} alt={item.name} />
                  <p className='font-medium text-gray-800'>{item.name}</p>
                </div>
                <div className='flex flex-col gap-3'>
                  <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Price ({currency})</label>
                    <input
                      type='number'
                      min='0'
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className='mt-1 block w-40 border border-gray-300 rounded px-2 py-1 outline-none focus:border-primary'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Description</label>
                    <textarea
                      rows='3'
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className='mt-1 block w-full border border-gray-300 rounded px-2 py-1 outline-none focus:border-primary resize-y'
                    />
                  </div>
                  <div>
                    <label className='text-xs font-bold text-gray-500 uppercase'>Stock by Size</label>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {(item.sizes || []).map((sz) => {
                        const out = (item.outOfStockSizes || []).includes(sz)
                        return (
                          <button
                            key={sz}
                            onClick={() => toggleSizeStock(item._id, sz, !out)}
                            title={out ? 'Click to mark in stock' : 'Click to mark out of stock'}
                            className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                              out
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-green-100 text-green-700 border-green-200'
                            }`}
                          >
                            {sz} · {out ? 'Out' : 'In'}
                          </button>
                        )
                      })}
                    </div>
                    <p className='text-[11px] text-gray-400 mt-1'>Click a size to toggle its stock (applied instantly).</p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => saveEdit(item._id)}
                      disabled={saving}
                      className='bg-primary text-white px-5 py-1.5 rounded text-xs font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className='bg-gray-100 text-gray-600 px-5 py-1.5 rounded text-xs font-medium hover:bg-gray-200 transition-all'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ---- Normal row ---- */
              <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={item._id}>
                <img className='w-12' src={item.images?.[0] || 'default-image-url'} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>{currency}{item.price}</p>
                <div className='text-center'>
                  <button
                    onClick={() => toggleStatus(item._id, item.available)}
                    className={`px-2 py-1 rounded text-[10px] font-bold ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {item.available ? 'AVAILABLE' : 'OUT OF STOCK'}
                  </button>
                </div>
                <div className='flex items-center justify-end md:justify-center gap-3'>
                  <button
                    onClick={() => startEdit(item)}
                    className='text-primary font-bold text-xs hover:underline'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeProduct(item._id)}
                    className='cursor-pointer text-lg text-red-500 font-bold leading-none'
                    aria-label='Remove product'
                  >
                    &times;
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </>
  )
}

export default List;
