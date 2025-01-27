'use client'

import { useState } from 'react'
import axios from 'axios'

export default function DatabaseCon() {
  const [databaseMessage, setDatabaseMessage] = useState('')

  async function handleClick() {
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/people')
    setDatabaseMessage(data.data)
  }

  return (
    <>
      <h1>This is the database connection test page</h1>
      <button onClick={handleClick}>Click to fetch message</button>
      <div>
        {databaseMessage.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </>
  )
}
