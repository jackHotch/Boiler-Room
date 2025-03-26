'use client'

import React, { useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import OwnedGamesGallery from '@/components/GameDisplays/OwnedGamesGallery/OwnedGamesGallery'
import TopRatedGames from '@/components/GameDisplays/TopRatedGames/TopRatedGames'
import axios, { getAdapter } from 'axios'

export default function Dashboard() {

  const [steamId, setSteamId] = useState(null)


  const [games, setGames] = useState([])

  useEffect(() => {
    checkLogin()
    async function checkLogin() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
          { withCredentials: true }
        )

        if (response.data.steamId) {
          setSteamId(response.data.steamId)

          localStorage.setItem('steamId', response.data.steamId)
        } else {
          //redirect to error page if not logged in
            window.location.href = '/LoginRedirect';
        }
      } catch (error) {
        window.location.href = '/LoginRedirect';
      }
    }

    const fetchGames = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/usergames', {
          withCredentials: true,
        }) // Use the backend port
        const games = response.data
        setGames(games)
      } catch (error) {
        console.error('Error fetching game images:', error)
      }
    }
    fetchGames()
  }, []) // Single dependency array

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
        <OwnedGamesGallery />
      </section>

      <section className={styles.otherGames}>
        <TopRatedGames />
      </section>
      <section className={styles.otherGames}>
        <GameTable games={games} />
      </section>
    </div>
  )
}
