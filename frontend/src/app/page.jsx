'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Login from '../components/SteamComponents/Login'
import Logout from '../components/SteamComponents/Logout'
import SteamIdDisplay from '../components/SteamComponents/SteamIdDisplay'

export default function Home() {
  const [databaseMessage, setdatabaseMessage] = useState('')
  const router = useRouter()

  async function handleClick() {
    // fetch data from the backend
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/supabase')
    setdatabaseMessage(data.data)
  }

  return (
    <>
      <SteamIdDisplay />    
      <h1>This is the home page.</h1>
      <button onClick={() => router.push('/DatabaseCon')}>
        Go to database test page
      </button>
      <button onClick={() => router.push('/Steam')}>Go to SteamAPI page</button>
      <p>{databaseMessage}</p>
    </>
  )
}
