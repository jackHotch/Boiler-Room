'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function page() {
  const [friendsList, setFriendsList] = useState([])

  useEffect(() => {
    try {
      const response = axios.get(process.env.NEXT_PUBLIC_BACKEND + '/steam/friendsList', {
        withCredentials: true,
      })

      setFriendsList(response.data)
    } catch (error) {
      console.error('Error fetching Steam ID:', error)
    }
  }, [])

  return (
    <div className={styles.container}>
      Friends
      <div className={styles.list_of_friends}>
        {friendsList?.map((friend, key) => {
          return (
            <div key={key}>
              <p>{friend.steamId}</p>
              <p></p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
