'use client'

import { useEffect, useState } from 'react'
import styles from './TopRatedGames.module.css'
import axios from 'axios'

const TopRatedGames = () => {
  const [ownedGames, setOwnedGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/usergames', {
          withCredentials: true,
        })
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
    fetchTopGames()
  }, [])

  if (loading) {
    return (
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Discover These Top-Rated Gems</a>
        <a className={styles.subHeader}>
          You already own these highly reviewed titles—dive in and experience the hype!
        </a>{' '}
        <p className={styles.loadingText}>Loading your games...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Discover These Top-Rated Gems</a>
        <a className={styles.subHeader}>
          You already own these highly reviewed titles—dive in and experience the hype!
        </a>{' '}
        <p className={styles.errorText}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Discover These Top-Rated Gems</a>
        <a className={styles.subHeader}>
          You already own these highly reviewed titles—dive in and experience the hype!
        </a>

        <div className={styles.gridContainer}>
          {ownedGames.length > 0 ? (
            ownedGames.map((game, key) => (
              <a
                key={key}
                href={`/SingleGame/${game.game_id}`}
                className={styles.imageWrapper}
              >
                <img
                  src={
                    game.header_image ||
                    `https://steamcdn-a.akamaihd.net/steam/apps/${game.game_id}/header.jpg`
                  }
                  alt={game.title || `Game ${game.game_id}`}
                  className={styles.gameImage}
                />
                <div className={styles.gameTitle}>
                  <small>
                    Go To Game Page
                    <img src='/redirect.png' className={styles.redirectImage}></img>
                  </small>{' '}
                </div>

                <div className={styles.gameCardInfo}>
                  <strong>{game.name}</strong>

                  <br />
                  <small>
                    {game.total_played > 0
                      ? (game.total_played / 60).toFixed(2) + ' Hours Played'
                      : "Looks like you haven't played this game"}
                  </small>
                  <span className={styles.boil_score}>
                    <br></br>
                    {'Boil Rating:\t' + Math.round(game.boil_score) + ' / 100'}
                  </span>
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

export default TopRatedGames
