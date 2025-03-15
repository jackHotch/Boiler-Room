'use client'

import React, { useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import axios from 'axios'

export default function Dashboard() {
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
        console.error('Error fetching game images:', error)
      }
    }
    fetchGames()
  }, [])

  const featuredGames = games.slice(0, 3)

  const featuredCategories = [
    { label: 'Quick Pick' },
    { label: 'Acclaimed Classic' },
    { label: 'Hidden Gem' },
  ]

  return (
    <div className={styles.container}>
      <section className={styles.featuredGames}>
        <DashGameGallery games={featuredGames} categories={featuredCategories} />
      </section>
      <hr />
      <section className={styles.otherGames}>
        <GameTable games={games} /> {/*change value of games when available*/}
      </section>
    </div>
  )
}
