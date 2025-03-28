'use client'

import React, { useEffect, useState } from 'react'
import styles from './Search.module.css'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import axios, { all } from 'axios'
import { useSearchParams } from 'next/navigation'

export default function Search() {
  const [loading, setLoading] = useState(false)
  const [allGames, setAllGames] = useState([])
  const [visibleGames, setVisibleGames] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 20

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('query')

  useEffect(() => {
    setLoading(true)
    const fetchGames = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/gamesByName?name=${encodeURIComponent(
            searchQuery
          )}`
        )

        setAllGames(response.data)
        setVisibleGames(response.data.slice(0, pageSize))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }
    fetchGames()
  }, [searchQuery])

  function handleLoadMore() {
    const nextPage = pageNumber + 1
    setVisibleGames(allGames.slice(0, pageSize * nextPage))
    setPageNumber(nextPage)
  }

  return (
    <div className={styles.container}>
      <section className={styles.otherGames}>
        <GameTable games={visibleGames} />
        <div className={styles.footer}>
          <span className={styles.num_results}>
            Showing {visibleGames.length} of {allGames.length} results
          </span>
          <button className={styles.load_more} onClick={handleLoadMore}>
            Load More Games
          </button>
        </div>
      </section>
    </div>
  )
}
