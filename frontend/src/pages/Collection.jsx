import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';


const Collection = () => {
  const {products, productsLoading, search, showSearch} = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);

  // Filters persist in sessionStorage so they survive navigating to a product
  // and back (the component remounts, which would otherwise reset this state).
  const readStored = (key, fallback) => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };
  const [category, setCategory] = useState(() => readStored('collection_category', []));
  const [subcategory, setSubcategory] = useState(() => readStored('collection_subcategory', []));
  const [sortType, setSortType] = useState(() => readStored('collection_sortType', 'relevant'));

  useEffect(() => {
    sessionStorage.setItem('collection_category', JSON.stringify(category));
    sessionStorage.setItem('collection_subcategory', JSON.stringify(subcategory));
    sessionStorage.setItem('collection_sortType', JSON.stringify(sortType));
  }, [category, subcategory, sortType]);

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if(subcategory.includes(e.target.value)){
      setSubcategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubcategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if(showSearch && search){
      const q = search.toLowerCase();
      productsCopy = productsCopy.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.subCategory?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }

    if(category.length > 0){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }

    if(subcategory.length > 0){
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subCategory))
    }

    // Apply Sorting
    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => (a.price - b.price));
        break;
      case 'high-low':
        productsCopy.sort((a, b) => (b.price - a.price));
        break;
      default:
        break;
    }

    setFilterProducts(productsCopy)
  }

  useEffect(()=>{
    applyFilter();
  }, [category, subcategory, search, showSearch, products, sortType])
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/*Filter options */}
      <div className='min-w-60'> 
      <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS</p> 
      <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
      {/* Category Filter */} 
      <div className={`border border-gray-300 p1-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <div className='w-fit mx-auto'>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Men'} checked={category.includes('Men')}/>Men
            </p>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Women'} checked={category.includes('Women')}/>Women
            </p>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Kids'} checked={category.includes('Kids')}/>Kids
            </p>
          </div>
        </div>
      </div>
      {/* Subcategory filters */}
      <div className={`border border-gray-300 p1-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <div className='w-fit mx-auto'>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Topwear'} checked={subcategory.includes('Topwear')}/>Topwear
            </p>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Bottomwear'} checked={subcategory.includes('Bottomwear')}/>Bottomwear
            </p>
            <p className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Winterwear'} checked={subcategory.includes('Winterwear')}/>Winterwear
            </p>
          </div>
        </div>
      </div>
      </div>
      {/*Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'}></Title>
          {/*Product sort */}
          <select value={sortType} onChange={(e)=>setSortType(e.target.value)} className="border border-gray-300 text-sm px-2 py-0 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer h-fit leading-tight" >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        {/*Map Products */}
        {productsLoading ? (
          // Skeleton placeholders until the real product list has loaded —
          // avoids briefly flashing the bundled fallback products.
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div className='bg-gray-200 rounded-2xl w-full aspect-[4/5]'></div>
                <div className='bg-gray-200 h-3 rounded mt-4 w-3/4'></div>
                <div className='bg-gray-200 h-3 rounded mt-2 w-1/3'></div>
              </div>
            ))}
          </div>
        ) : filterProducts.length === 0 ? (
          // No product matches the current filter / search combination.
          <div className='flex flex-col items-center justify-center text-center py-24 text-gray-500'>
            <p className='text-lg font-medium text-gray-700'>No products found</p>
            <p className='text-sm mt-1'>
              Nothing matches your selected filters{search ? ' and search' : ''}. Try a different category or type.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {filterProducts.map((item, index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image} available={item.available} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection;
