'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [databaseMessage, setdatabaseMessage] = useState('')
  const router = useRouter()

  async function handleClick() {
    // fetch data from the backend
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/supabase')
    setdatabaseMessage(data.data)
  }

  async function getRandomGameIds() {
    try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/games');
        console.log("Random game IDs:", response.data);
    } catch (error) {
        console.error("Error fetching game IDs:", error);
    }
    
}


  return (
    <>
      <h1>This is the home page.</h1>
      <button onClick={() => router.push('/DatabaseCon')}>
        Go to database test page
      </button>
      <button onClick={() => router.push('/Steam')}>Go to SteamAPI page</button>
      <p>{databaseMessage}</p>
      <button onClick = {getRandomGameIds}> Get random images </button>
    </>
  )
}
