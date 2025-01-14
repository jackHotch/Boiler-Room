'use client'

import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [backendMessage, setBackendMessage] = useState('')

  async function handleClick() {
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/test')
    setBackendMessage(data.data)
  }

  return (
    <>
      <h1>This is the home page</h1>
      <button onClick={handleClick}>click to fetch message</button>
      <p>{backendMessage.message}</p>
    </>
  )
}
