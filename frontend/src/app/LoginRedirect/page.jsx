'use client'
import React, { useRef } from 'react'
import styles from './LoginRedirect.module.css'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import axios from 'axios'


const LoginRedirect = () => {
  const footerRef = useRef(null)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <h1 className={styles.logo}>Boiler Room</h1>
          <nav>
            <ul className={styles.navList}>
              <li>
                <ThemeToggle />
              </li>
              <li>
                <a
                  href={process.env.NEXT_PUBLIC_BACKEND + '/auth/steam'}
                  className={styles.navLink}
                >
                  Sign In With Steam
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Error: Not Logged In</h2>
            <p className={styles.heroSubtitle}>
              Please log in or return to the Landing Page
            </p>
            <p>
            <a href={process.env.NEXT_PUBLIC_BACKEND + '/auth/steam'}
                  className={styles.loginButton}>
                  Sign In With Steam
                </a>
                <a href='./' className={styles.landingButton}>Return to Landing</a>
            </p>
          </div>
        </div>
      </section>
      {/*Dynamically Update the featured games section to display 3 random games from the data base.*/}
    

      <footer ref={footerRef} className={styles.footer}>
        {' '}
        &copy; 2025 Boiler Room. All rights reserved.
      </footer>
    </div>
  )
}

export default LoginRedirect
