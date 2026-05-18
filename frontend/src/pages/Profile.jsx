import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [userData, setUserData] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const loadUserProfileData = async () => {
        try {
            const response = await axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } });
            if (response.data.success) {
                console.log("Received User Data:", response.data.user);
                setUserData(response.data.user);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('phone', userData.phone);
            formData.append('address', userData.address);
            
            if (image) {
                formData.append('image', image);
            }

            const response = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setIsEdit(false);
                setImage(false);
                await loadUserProfileData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const cancelPasswordChange = () => {
        setShowPasswordForm(false);
        setPasswordData({ current: '', newPass: '', confirm: '' });
    }

    const handleChangePassword = async () => {
        const { current, newPass, confirm } = passwordData;

        if (!current || !newPass || !confirm) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (newPass.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (newPass !== confirm) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPass === current) {
            toast.error('New password must be different from the current one');
            return;
        }

        try {
            setChangingPassword(true);
            const response = await axios.post(
                backendUrl + '/api/user/change-password',
                { currentPassword: current, newPassword: newPass },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(response.data.message);
                cancelPasswordChange();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setChangingPassword(false);
        }
    }

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        }
    }, [token])

    if (!userData) {
        return (
            <div className='min-h-[70vh] flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
            </div>
        )
    }

    return (
        <div className='min-h-[70vh] py-20 px-4'>
            <div className='max-w-4xl mx-auto'>
                <div className='text-center mb-12'>
                    <Title text1={'MY'} text2={'PROFILE'} />
                    <p className='text-gray-500 mt-2'>Manage your personal information and account settings.</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10'>
                    {/* Left Side: Avatar and Quick Info */}
                    <div className='bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-primary/5 shadow-sm flex flex-col items-center text-center h-fit'>
                        <div className='relative group mb-6'>
                            <label htmlFor="image" className='cursor-pointer relative block'>
                                <div className='relative w-32 h-32 mx-auto'>
                                    <img 
                                        src={image ? URL.createObjectURL(image) : (userData.image || assets.profile_icon)} 
                                        className={`w-32 h-32 rounded-full border-4 border-white shadow-md object-cover ${isEdit ? 'opacity-70' : ''} bg-primary/5`} 
                                        alt="Avatar" 
                                    />
                                    {isEdit && (
                                        <div className='absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <img src={assets.upload_icon} className='w-8 invert' alt="" />
                                        </div>
                                    )}
                                </div>
                                {isEdit && <input type="file" id="image" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />}
                            </label>
                            {!isEdit && userData.image && (
                                <div className='absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full border-2 border-white shadow-sm'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <h3 className='text-2xl font-bold text-gray-800'>{userData.name}</h3>
                        <p className='text-primary font-medium text-sm mb-6'>Member</p>
                        
                        <div className='w-full space-y-3 pt-6 border-t border-primary/10'>
                            {isEdit ? (
                                <button 
                                    onClick={updateUserProfileData}
                                    className='w-full py-3 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/20'
                                >
                                    Save Profile
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEdit(true)}
                                    className='w-full py-3 px-6 rounded-2xl bg-white border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm'
                                >
                                    Edit Profile
                                </button>
                            )}
                            {isEdit && (
                                <button 
                                    onClick={() => { setIsEdit(false); setImage(false); }}
                                    className='w-full py-2 px-6 rounded-2xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all'
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Detailed Info */}
                    <div className='space-y-6'>
                        <div className='bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-primary/5 shadow-sm'>
                            <p className='text-xl font-bold text-gray-800 mb-8 pb-4 border-b border-primary/5'>Personal Information</p>
                            
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                                <div>
                                    <p className='text-xs font-bold text-primary/60 uppercase tracking-wider mb-1'>Full Name</p>
                                    {isEdit ? (
                                        <input 
                                            className='bg-white/50 border border-primary/10 rounded-lg px-3 py-1 text-gray-800 w-full outline-none focus:border-primary' 
                                            type="text" 
                                            value={userData.name} 
                                            onChange={(e) => setUserData(prev => ({...prev, name: e.target.value}))}
                                        />
                                    ) : (
                                        <p className='text-gray-800 font-medium'>{userData.name}</p>
                                    )}
                                </div>
                                <div>
                                    <p className='text-xs font-bold text-primary/60 uppercase tracking-wider mb-1'>Email Address</p>
                                    <p className='text-gray-500 font-medium'>{userData.email}</p>
                                    <p className='text-[10px] text-gray-400 mt-1'>(Email cannot be changed)</p>
                                </div>
                                <div>
                                    <p className='text-xs font-bold text-primary/60 uppercase tracking-wider mb-1'>Phone Number</p>
                                    {isEdit ? (
                                        <input 
                                            className='bg-white/50 border border-primary/10 rounded-lg px-3 py-1 text-gray-800 w-full outline-none focus:border-primary' 
                                            type="text" 
                                            value={userData.phone} 
                                            placeholder='Add phone number'
                                            onChange={(e) => setUserData(prev => ({...prev, phone: e.target.value}))}
                                        />
                                    ) : (
                                        <p className='text-gray-800 font-medium'>{userData.phone || "Not provided"}</p>
                                    )}
                                </div>
                                <div>
                                    <p className='text-xs font-bold text-primary/60 uppercase tracking-wider mb-1'>Default Address</p>
                                    {isEdit ? (
                                        <textarea 
                                            className='bg-white/50 border border-primary/10 rounded-lg px-3 py-1 text-gray-800 w-full outline-none focus:border-primary resize-none' 
                                            rows="3"
                                            value={userData.address} 
                                            placeholder='Add shipping address'
                                            onChange={(e) => setUserData(prev => ({...prev, address: e.target.value}))}
                                        />
                                    ) : (
                                        <p className='text-gray-800 font-medium leading-relaxed'>{userData.address || "No address saved"}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-primary/5 shadow-sm'>
                            <p className='text-xl font-bold text-gray-800 mb-6'>Account Security</p>
                            <div className='flex items-center justify-between py-4 border-b border-primary/5'>
                                <div>
                                    <p className='font-medium text-gray-800'>Change Password</p>
                                    <p className='text-sm text-gray-500'>Keep your account secure with a strong password.</p>
                                </div>
                                {!showPasswordForm && (
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className='text-primary font-bold hover:text-secondary transition-colors'
                                    >
                                        Change
                                    </button>
                                )}
                            </div>

                            {showPasswordForm && (
                                <div className='mt-6 space-y-4'>
                                    <input
                                        type='password'
                                        placeholder='Current password'
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                                        className='bg-white/50 border border-primary/10 rounded-lg px-3 py-2 w-full outline-none focus:border-primary'
                                    />
                                    <input
                                        type='password'
                                        placeholder='New password (min 8 characters)'
                                        value={passwordData.newPass}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPass: e.target.value }))}
                                        className='bg-white/50 border border-primary/10 rounded-lg px-3 py-2 w-full outline-none focus:border-primary'
                                    />
                                    <input
                                        type='password'
                                        placeholder='Confirm new password'
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                                        className='bg-white/50 border border-primary/10 rounded-lg px-3 py-2 w-full outline-none focus:border-primary'
                                    />
                                    <div className='flex gap-3 pt-1'>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={changingPassword}
                                            className='py-2 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-secondary transition-all active:scale-95 shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed'
                                        >
                                            {changingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                        <button
                                            onClick={cancelPasswordChange}
                                            disabled={changingPassword}
                                            className='py-2 px-6 rounded-2xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
