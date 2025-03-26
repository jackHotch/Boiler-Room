'use client'

import React, { useEffect, useState } from 'react'
import styles from './Search.module.css'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

export default function Search() {
  const [games, setGames] = useState([])
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('query')

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/gamesByName?name=${encodeURIComponent(
            searchQuery
          )}`
        )

        setGames(response.data.slice(0, 10))
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
