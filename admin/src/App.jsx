import React, { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import Insights from './pages/Insights';
import Users from './pages/Users';
import Login from './components/Login';
import SplashScreen from './components/SplashScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  useEffect(()=>{
    localStorage.setItem('token', token)
  }, [token])

  // Branded loading window shown once per page load/reload:
  // 'loading' (1s solid) -> 'fading' (0.5s fade-out) -> 'done' (removed).
  const [splash, setSplash] = useState('loading');
  useEffect(() => {
    const t1 = setTimeout(() => setSplash('fading'), 1000);
    const t2 = setTimeout(() => setSplash('done'), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {splash !== 'done' && <SplashScreen fading={splash === 'fading'} />}
      <ToastContainer/>
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <NavBar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 mx-8 my-8 text-gray-700 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token}/>} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/order" element={<Orders token={token} />} />
                <Route path="/insights" element={<Insights token={token} />} />
                <Route path="/users" element={<Users token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
