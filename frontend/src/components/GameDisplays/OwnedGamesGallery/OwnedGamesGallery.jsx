'use client'

import { useEffect, useState } from 'react'
import styles from './OwnedGamesGallery.module.css'
import axios from 'axios'

const OwnedGamesGallery = () => {
  const [ownedGames, setOwnedGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOwnedGames = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/ownedGames',
          {
            withCredentials: true,
          }
        )
        const games = response.data

        // Sort games by playtime_forever in descending order (most played first)
        let sortedGames = games.sort((a, b) => b.playtime_forever - a.playtime_forever)
        sortedGames = sortedGames.slice(0, 12)
        setOwnedGames(sortedGames)
      } catch (error) {
        console.error('Error fetching owned games:', error.message, error.response?.data)
        setError('Failed to load owned games. Please log in with Steam.')
      } finally {
        setLoading(false)
      }
    }
    fetchOwnedGames()
  }, [])

  if (loading) {
    return (
      <div className={styles.scrollContainer}>
        <h1>Your Top Played Games</h1>
        <p className={styles.loadingText}>Loading your games...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.scrollContainer}>
        <h1>Your Top Played Games</h1>
        <p className={styles.errorText}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Your Top Played Games</h1>
      <div className={styles.scrollContainer}>
        <div className={styles.gridContainer}>
          {ownedGames.length > 0 ? (
            ownedGames.map((game) => (
              <a
                key={game.id}
                href={`/SingleGame/${game.id}`}
                className={styles.imageWrapper}
              >
                <img
                  src={
                    game.header_image ||
                    `https://steamcdn-a.akamaihd.net/steam/apps/${game.id}/header.jpg`
                  }
                  alt={game.title || `Game ${game.id}`}
                  className={styles.gameImage}
                />
                <div className={styles.gameTitle}>
                  {game.title}
                  <br />
                  <small>{Math.floor(game.playtime_forever / 60)} hours played</small>
                </div>
              </a>
            ))
          ) : (
            <p className={styles.loadingText}>No owned games to display</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnedGamesGallery
