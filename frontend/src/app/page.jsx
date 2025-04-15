'use client'
import React, { useEffect, useState, useRef } from 'react'
import styles from './Home.module.css'
import axios from 'axios'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { CookieMessage } from '@/components/CookieMessage/CookieMessage'
import { Searchbar } from '@/components/Navbar/Searchbar/Searchbar'
import LandingGames from '@/components/GameDisplays/LandingGames/LandingGames'

const LandingPage = () => {
  const [games, setGames] = useState([])
  const footerRef = useRef(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/featuredgames'
        ) // Use the backend port

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

  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.navContainer}>
            <img className={styles.logo} src='BRLogo.png' width={300} />
            <nav>
              <ul className={styles.navList}>
                <Searchbar />
                <li>
                  <ThemeToggle />
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>Welcome to Boiler Room</h2>
              <p className={styles.heroSubtitle}>
                Boil down your backlog, optimize your gametime, discover and rediscover
                highly-rated games that fit your schedule
              </p>
              <a
                href={process.env.NEXT_PUBLIC_BACKEND + '/auth/steam'}
                className={styles.loginButton}
              >
                Sign In With Steam
              </a>
              <a href='/Search' className={styles.exploreButton}>
                Explore Games
              </a>
            </div>
          </div>
        </section>
        {/*Dynamically Update the featured games section to display 3 random games from the data base.*/}
        <LandingGames games={games} />

        <footer ref={footerRef} className={styles.footer}>
          {' '}
          &copy; 2025 Boiler Room. All rights reserved.
        </footer>
      </div>

      <CookieMessage />
    </>
  )
}

export default LandingPage
