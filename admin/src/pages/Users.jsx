import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

// Date a user's account was created — derived from the MongoDB ObjectId.
const joinedOn = (id) => {
  try {
    const ts = parseInt(id.substring(0, 8), 16) * 1000
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/user/list', { headers: { token } })
      if (response.data.success) {
        setUsers(response.data.users)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = query
    ? users.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      )
    : users

  return (
    <>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3'>
        <p>Registered Users <span className='text-gray-400'>({filtered.length})</span></p>

        {/* Search */}
        <div className='flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 bg-white w-full sm:w-80 focus-within:ring-2 focus-within:ring-primary/20 transition-all'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z' />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type='text'
            placeholder='Search by name, email or phone...'
            className='outline-none text-sm flex-1 bg-transparent'
          />
          {search && (
            <button onClick={() => setSearch('')} className='text-gray-400 hover:text-gray-600 text-lg leading-none' aria-label='Clear search'>&times;</button>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {/* Table header */}
        <div className='hidden md:grid grid-cols-[0.6fr_2fr_2.5fr_1.5fr_1fr] items-center py-2 px-3 border bg-gray-100 text-sm'>
          <b>Photo</b>
          <b>Name</b>
          <b>Email</b>
          <b>Phone</b>
          <b className='text-center'>Role</b>
        </div>

        {filtered.length === 0 ? (
          <div className='py-16 text-center text-gray-500 border'>
            {query ? `No users match "${search}".` : 'No users found.'}
          </div>
        ) : (
          filtered.map((user) => (
            <div
              className='grid grid-cols-[0.6fr_2fr_1.5fr] md:grid-cols-[0.6fr_2fr_2.5fr_1.5fr_1fr] items-center gap-2 py-2 px-3 border text-sm'
              key={user._id}
            >
              {/* Avatar — photo if set, otherwise an initial badge */}
              {user.image ? (
                <img className='w-10 h-10 rounded-full object-cover border' src={user.image} alt={user.name} />
              ) : (
                <div className='w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center uppercase'>
                  {user.name?.charAt(0) || '?'}
                </div>
              )}

              <div>
                <p className='font-medium text-gray-800'>{user.name}</p>
                <p className='text-[11px] text-gray-400'>Joined {joinedOn(user._id)}</p>
              </div>

              <p className='break-all text-gray-600'>{user.email}</p>
              <p className='text-gray-600'>{user.phone || '—'}</p>

              <div className='text-center'>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default Users
