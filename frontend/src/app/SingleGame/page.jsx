import styles from './SingleGame.module.css';
import React from 'react';

export default function SingleGame() {
  return (
    <div className={styles.singleGameContainer}>
      <h1 className={styles.gameTitle}>Game Title</h1>
      <div className={styles.gameContent}>
        {/* Left Column */}
        <div className={styles.gameLeft}>
          <div className={styles.cover}>Cover</div>
          <div className={styles.gameInfo}>addl. game info</div>
        </div>

        {/* Right Column */}
        <div className={styles.gameRight}>
          <div className={styles.gameSummary}>Game Summary</div>
          <div className={styles.ratings}>Ratings</div>
          <div className={styles.reviews}>Reviews/Discussion</div>
          <div className={styles.playStatus}>Rate/Mark Play Status</div>
          <div className={styles.writeReview}>Write a review/post</div>
        </div>
      </div>
    </div>
  );
}