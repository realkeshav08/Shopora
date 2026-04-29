import React, { useState } from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState]= useState('Login');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try{
      if(currentState === 'Sign Up'){
        const response = await axios.post(backendUrl + '/api/user/register', {name, email, password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Login') {
        const response = await axios.post(backendUrl + '/api/user/login', {email, password})
        if(response.data.success){
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Forgot Password') {
        const response = await axios.post(backendUrl + '/api/user/forgot-password', {email})
        if(response.data.success){
          toast.success(response.data.message)
          setCurrentState('Reset Password')
        } else {
          toast.error(response.data.message)
        }
      } else if (currentState === 'Reset Password') {
        const response = await axios.post(backendUrl + '/api/user/reset-password', {email, otp, newPassword})
        if(response.data.success){
          toast.success(response.data.message)
          setCurrentState('Login')
        } else {
          toast.error(response.data.message)
        }
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    if(token){
      navigate('/')
    }
  }, [token])

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4'>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-full max-w-md bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/50 gap-6 text-gray-800 animate-in fade-in zoom-in duration-500'>
        <div className='flex flex-col items-center gap-2 mb-4'>
          <p className='prata-regular text-4xl text-primary drop-shadow-sm'>{currentState}</p>
          <hr className='border-none h-[3px] w-12 bg-primary rounded-full shadow-sm'/>
        </div>

        <div className='w-full flex flex-col gap-4'>
          {currentState === 'Sign Up' && (
            <div className='relative'>
              <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-white/70' placeholder='Full Name' required/>
            </div>
          )}

          {currentState !== 'Reset Password' && (
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-white/70' placeholder='Email address' required/>
          )}

          {currentState === 'Reset Password' && (
            <>
              <input onChange={(e)=>setOtp(e.target.value)} value={otp} type="text" className='w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-white/70' placeholder='6-Digit OTP' required maxLength='6'/>
              <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} type="password" className='w-full px-5 py-3.5 rounded-xl border border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-white/70' placeholder='New Password' required/>
            </>
          )}

          {(currentState === 'Login' || currentState === 'Sign Up') && (
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" className='w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none bg-white/70' placeholder='Password' required/>
          )}
        </div>

        <div className='w-full flex justify-between text-sm text-gray-500 px-1'>
          {currentState === 'Login' ? (
            <p onClick={() => setCurrentState('Forgot Password')} className='cursor-pointer hover:text-primary transition-colors font-medium'>Forgot your password?</p>
          ) : (
            <p onClick={() => setCurrentState('Login')} className='cursor-pointer hover:text-primary transition-colors font-medium'>Back to Login</p>
          )}
          
          {currentState === 'Login' && (
            <p onClick={()=> setCurrentState('Sign Up')} className='cursor-pointer hover:text-primary transition-colors font-bold text-primary'>Create account</p>
          )}
          {currentState === 'Sign Up' && (
            <p onClick={()=> setCurrentState('Login')} className='cursor-pointer hover:text-primary transition-colors font-bold text-primary'>Login Here</p>
          )}
        </div>

        <button className='w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all duration-300 mt-2 uppercase tracking-widest text-xs'>
          {currentState === 'Login' ? 'Sign In' : currentState === 'Sign Up' ? 'Create Account' : 'Confirm'}
        </button>
      </form>
    </div>
  )
}

export default Login;
