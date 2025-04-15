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

        // Sort and take top 4 games by recent playtime
        const sorted = games
          .sort((a, b) => b.playtime_2weeks - a.playtime_2weeks)
          .slice(0, 4)

        setOwnedGames(sorted)
      } catch (err) {
        console.error('Error fetching owned games:', err.message, err.response?.data)
        setError('Failed to load owned games. Please log in with Steam.')
      } finally {
        setLoading(false)
      }
    }

    fetchOwnedGames()
  }, [])

  // UI: Loading
  if (loading) {
    return (
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Dive Back Into the Action</a>
        <a className={styles.subHeader}>
          Pick up where you left off in these recent games
        </a>
        <p className={styles.loadingText}>Loading your games...</p>
      </div>
    )
  }

  if (error) {
    console.log('Error:', error)
    return (
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Dive Back Into the Action</a>
        <a className={styles.subHeader}>
          Pick up where you left off in these recent games
        </a>
        <p className={styles.loadingText}>{error}</p>
      </div>
    )
  }
  {
  }

  // UI: No recent games played
  const hasRecent = ownedGames.some((game) => game.playtime_2weeks > 0)
  if (!hasRecent) {
    return (
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Dive Back Into the Action</a>
        <a className={styles.subHeader}>
          Looks like you haven’t played anything recently — no worries, your games are
          waiting!
        </a>
      </div>
    )
  }

  // UI: Games loaded with recent activity
  return (
    <div className={styles.scrollContainer}>
      <a className={styles.sectionHeader}>Dive Back Into the Action</a>
      <a className={styles.subHeader}>Pick up where you left off in these recent games</a>
      <div className={styles.gridContainer}>
        {ownedGames.map((game) => (
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
              <small>
                Go To Game Page
                <img src='/redirect.png' className={styles.redirectImage}></img>
              </small>
            </div>
            <div className={styles.gameCardInfo}>
              <strong>{game.title}</strong>
              <br />
              <small>
                {game.playtime_2weeks > 0
                  ? (game.playtime_2weeks / 60).toFixed(2) + ' Hours Played'
                  : "Huh? You haven't played this recently"}
              </small>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default OwnedGamesGallery
