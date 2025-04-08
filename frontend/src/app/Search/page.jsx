'use client'

import React, { useEffect, useState } from 'react'
import styles from './Search.module.css'
import GameTable from '@/components/GameDisplays/SearchTable/SearchTable'
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

        setGames(response.data)
        console.log('Fetched games:', response.data[0].name)
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }
    fetchGames()
  }, [searchQuery])

  return (
    <div className={styles.container}>
      <section className={styles.otherGames}>
        <GameTable games={games} />
      </section>
    </div>
  )
}
