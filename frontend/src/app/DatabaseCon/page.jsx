'use client'

import { useState } from 'react'
import axios from 'axios'

export default function DatabaseCon() {
  const [databaseMessage, setdatabaseMessage] = useState('')

  async function handleClick() {
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/people')
    setdatabaseMessage(data.data)
  }

  return (
    <>
      <h1>This is the database connection test page</h1>
      <button onClick={handleClick}>click to fetch message</button>
      <p>{databaseMessage}</p>
    </>
  )
}
