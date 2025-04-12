import styles from './FriendsRecentGames.module.css'

export function FriendsRecentGames({ games }) {
  return (
    <div>
      <div className={styles.scrollContainer}>
        <h1 className={styles.sectionHeader}>Recently Played Games</h1>
        <div className={styles.gridContainer}>
          {games.length > 0 ? (
            games.map((game) => {
              return game.gameId == -1 ? (
                <span key={game.gameId} className={styles.no_recent_games_message}>
                  Your friend hasn't played any games recently
                </span>
              ) : (
                <a
                  key={game.gameId}
                  href={`/SingleGame/${game.gameId}`}
                  className={styles.imageWrapper}
                >
                  <img
                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.gameId}/header.jpg`}
                    alt={game.title || `Game ${game.gameId}`}
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
                    <small className={styles.hoursPlayed}>
                      {game.playtime > 0
                        ? (game.playtime / 60).toFixed(2) + ' Hours Played Recently'
                        : "Huh? You haven't played this recently"}
                    </small>
                  </div>
                </a>
              )
            })
          ) : (
            <p className={styles.loadingText}>No owned games to display</p>
          )}
        </div>
      </div>
    </div>
  )
}
