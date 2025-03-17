// page.jsx
import styles from './NewGameRecs.module.css';

export default function GameRecommendation() {
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
