'use client'

import React, { useEffect, useState } from 'react'
import styles from './Search.module.css'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import axios from 'axios'

export default function Search() {
  {
    /*A component for some filters and parameters should eventually go here*/
  }

  const [games, setGames] = useState([])

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/games') // Use the backend port

        // Ensure the response is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON')
        }

        const data = response.data
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }
    fetchGames()
  }, [])

  return (
    <div className={styles.container}>
      <section className={styles.otherGames}>
        <GameTable games={games} />
      </section>
    </div>
  )
}
