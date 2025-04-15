'use client'

import { use, useState } from 'react'
import styles from './TopRatedGames.module.css'

const TopRatedGames = ({ games }) => {
  return (
    <div>
      <div className={styles.scrollContainer}>
        <a className={styles.sectionHeader}>Discover These Top-Rated Gems</a>
        <a className={styles.subHeader}>
          You already own these highly reviewed titles—dive in and experience the hype!
        </a>

        <div className={styles.gridContainer}>
          {games.length > 0 ? (
            games
              .filter((game) => {
                return game.hide === 0 // returns true for games with hide === 0
              })
              .slice(0, 12)
              .map((game, key) => (
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
