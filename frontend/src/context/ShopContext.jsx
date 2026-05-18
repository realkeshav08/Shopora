import { createContext, useEffect, useState } from "react"; 
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { products as assetsProducts } from "../assets/assets";



export const ShopContext = createContext(); 

const ShopContextProvider = (props) => { 
    const currency = '₹';
    const delivery_fee = 10; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    // Rehydrate the cart from localStorage so it survives a page refresh
    // (covers guests; for logged-in users getUserCart then syncs from the server).
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('cartItems');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });
    const [products, setProducts] = useState(assetsProducts)
    // True until the real product list has been fetched from the backend, so
    // pages can show skeletons instead of flashing the bundled fallback list.
    const [productsLoading, setProductsLoading] = useState(true)
    const [token, setToken] = useState('')
    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if(!size){
            toast.error('Select Product Size');
            return;
        }
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }
            else{
                cartData[itemId][size] = 1;
            }
        }
        else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        if(token){
            try{
                await axios.post(backendUrl + '/api/cart/add', {itemId, size}, {headers:{token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.message)
            }
        }
        
    }
       
    const getCartCount = () => {
        let totalCount = 0;
        for(const items in cartItems){
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item] > 0){
                        totalCount += cartItems[items][item]
                    }
                }
                catch(error){
                
                }
            }   
        }
        return totalCount;
    }
    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        if(token){
            try{
                await axios.post(backendUrl + '/api/cart/update', {itemId, size, quantity}, {headers: {token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.message)
            }
        }
    }
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            for(const item in cartItems[items]){
                try{
                    if(itemInfo && cartItems[items][item] > 0){
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                }
                catch (error){

                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            setProductsLoading(true)
            const response = await axios.get(backendUrl + '/api/product/list')
            if(response.data.success){
                // Only update if the backend actually has products to show
                if (response.data.products && response.data.products.length > 0) {
                    const mappedProducts = response.data.products.map(p => ({
                        ...p,
                        image: p.image || p.images // Map 'images' (backend) to 'image' (frontend fallback)
                    }));
                    setProducts(mappedProducts);
                } else {
                    console.log("Backend returned no products, sticking with assets.");
                }
            }
        }
        catch (error){
            console.log(error)
            toast.error(error.message)
        }
        finally {
            setProductsLoading(false)
        }
    }

    const getUserCart = async (token) => {
        try{
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers: {token}})
            if(response.data.success){
                setCartItems(response.data.message || {});
            }
        }
        catch (error){
            console.log(error)
            toast.error(error.message)
        }
    }
    // Persist the cart on every change so a refresh never loses it.
    useEffect(()=>{
        localStorage.setItem('cartItems', JSON.stringify(cartItems))
    }, [cartItems])

    useEffect(()=>{
        getProductsData()
    }, [token])

    useEffect(()=>{
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
    }, [token])

    const value = {
        products, productsLoading, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart,
        getCartCount, updateQuantity, getCartAmount,
        navigate, backendUrl, token, setToken,
        setProducts
    }
    return ( 
        <ShopContext.Provider value={value}> 
            {props.children}
        </ShopContext.Provider> 
    ) 
} 
export default ShopContextProvider;