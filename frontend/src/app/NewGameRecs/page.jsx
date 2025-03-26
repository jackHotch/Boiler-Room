// page.jsx
'use client'

import React from 'react'
import styles from './NewGameRecs.module.css';
import axios from 'axios'


export default function GameRecommendation() {
  //Function to check for login and redirect
  //to error page if not logged in
  checkLogin()
  async function checkLogin() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
        { withCredentials: true }
      )
      if (!response.data.steamId) {
        //redirect to error page if not logged in
          window.location.href = '/LoginRedirect';
      }
    } catch (error) {
      window.location.href = '/LoginRedirect';
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.recommendedGames}>
        <div className={styles.sectionTitle}>Recommended Games</div>
        <div className={styles.gamesGrid}>
          <div className={styles.gameCard}></div>
          <div className={styles.gameCard}></div>
          <div className={styles.gameCard}></div>
          <div className={styles.filters}></div> {/* Filter box */}
        </div>
      </div>
    </div>
  );
}
