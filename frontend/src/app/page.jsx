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

  return (
    <>
      <h1>This is the home page</h1>
      <button onClick={() => router.push('/SingleGame')}>Go to single game page</button>
      <button onClick={() => router.push('/DatabaseCon')}>Go to database test page</button>
      <button onClick={handleClick}>click to fetch message</button>
      <p>{databaseMessage}</p>
    </>
  )
}
