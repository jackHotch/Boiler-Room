'use client'

import React, { useEffect, useState } from 'react'
import styles from './Dashboard.module.css'
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery'
import GameTable from '@/components/GameDisplays/GameTable/GameTable'
import OwnedGamesGallery from '@/components/GameDisplays/OwnedGamesGallery/OwnedGamesGallery'
import TopRatedGames from '@/components/GameDisplays/TopRatedGames/TopRatedGames'
import axios from 'axios'

export default function Dashboard() {
  const [games, setGames] = useState([])
  const [topGames, setTopGames] = useState([])
  const [featuredGamesArray, setFeaturedGamesArray] = useState([])

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/usergames`, {
        withCredentials: true,
        params: {
          getHidden: 2,
        },
      })

      setGames(response.data)
      setTopGames(response.data)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
          { withCredentials: true }
        )
        if (!response.data.steamId) {
          window.location.href = '/LoginRedirect'
        }
      } catch (error) {
        window.location.href = '/LoginRedirect'
      }
    }
    if (!process.env.JEST_WORKER_ID) {
      checkLogin()
    }
  }, []) // Runs once on mount

  useEffect(() => {
    fetchGames()
  }, []) // Fetch games

  useEffect(() => {
    if (games.length > 0) {
      setFeaturedGamesArray(featuredGames(games))
    }
  }, [games]) // Re-run when `games` updates

  const featuredGames = (games) => {
    if (!games || games.length === 0) {
      console.error('No games available!')
      return []
    }

    // Filter out games without hltb_score or metacritic_score
    const validGames = games
      .filter((game) => game.hltb_score !== null && game.metacritic_score !== null)
      .filter((game) => game.hide == 0)

    if (validGames.length === 0) {
      console.error('No valid games with both hltb_score and metacritic_score!')
      return []
    }

    const sortedGames = [...validGames].sort((a, b) => b.positive - a.positive)
    const currentYear = new Date().getFullYear()

    // Find an acclaimed classic (a game that is at least 5 years old)
    const acclaimedClassic =
      sortedGames.find((game) => {
        if (!game.released) return false
        const releaseYear = parseInt(game.released.split('-')[0], 10)
        return currentYear - releaseYear >= 5
      }) || null

    // Find a hidden gem: game with the lowest total reviews but the highest positive review percentage
    // Note: We may switch out with a hand picked table of games later
    const hiddenGem =
      sortedGames
        .filter((game) => game.positive + game.negative > 0) // Ensure it has reviews
        .sort((a, b) => {
          const aTotalReviews = a.positive + a.negative
          const bTotalReviews = b.positive + b.negative

          // Sort first by total reviews (ascending), then by positive percentage (descending)
          return (
            aTotalReviews - bTotalReviews ||
            b.positive / bTotalReviews - a.positive / aTotalReviews
          )
        })[0] || null

    const sorted = sortedGames.sort((a, b) => {
      if (b.positive === a.positive) {
        return a.hltb_score - b.hltb_score // lower hltb_score wins tie
      }
      return b.positive - a.positive // higher positive score first
    })

    const quickPick =
      sorted
        .filter(
          (game) =>
            game.hltb_score !== null &&
            game.game_id !== acclaimedClassic.game_id &&
            game.game_id !== hiddenGem.game_id
        )
        .sort((a, b) => a.hltb_score - b.hltb_score)[0] || null

    return [quickPick, acclaimedClassic, hiddenGem]
  }

  const featuredCategories = [
    { label: 'Quick Pick' },
    { label: 'Acclaimed Classic' },
    { label: 'Hidden Gem' },
  ]

  function gameHidden() {
    fetchGames()
  }

  return (
    <div className={styles.container}>
      <section className={styles.featuredGames}>
        <DashGameGallery games={featuredGamesArray} categories={featuredCategories} />
      </section>

      <section className={styles.JumpBackIn}>
        <OwnedGamesGallery />
      </section>

      <section className={styles.TopRatedGames}>
        <TopRatedGames games={games} onGamesUpdate={() => fetchGames()} />
      </section>

      <section className={styles.GameTable}>
        <GameTable games={games} onGamesUpdate={() => fetchGames()} />
      </section>
    </div>
  )
}
