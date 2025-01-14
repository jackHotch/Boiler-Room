'use client'

import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [databaseMessage, setdatabaseMessage] = useState('')

  async function handleClick() {
    // fetch data from the backend
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/supabase')
    setdatabaseMessage(data.data)
  }

  return (
    <>
      <h1>This is the home page</h1>
      <button onClick={handleClick}>click to fetch message</button>
      <p>{databaseMessage}</p>
    </>
  )
}
