'use client'

import { useState, useEffect } from 'react'
import styles from './LandingGames.module.css'

const LandingGames = ({ games, categories }) => {

  return (
    <section className={styles.featuredGames}>
          <h3 className={styles.sectionTitle}>Featured Games</h3>
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <div key={index} className={styles.gameCard}>
                {/* Link to the game's Steam page */}
                <a href={`/SingleGame/${game.game_id}`}
                className={styles.imageWrapper}>
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className={styles.gameImage}
                  />
                    <div className={styles.gameTitle}>
                        <small>
                            Go To Game Page
                            <img src='/redirect.png' className={styles.redirectImage}></img>
                        </small>
                    </div>
                </a>
                <h4 className={styles.gameTitle}>{game.name}</h4>
                <div className={styles.gameStats}>
                    <div className={styles.stat}>
                        <div>
                        BOIL Rating: {game.boil_score ? game.boil_score : "N/A"}
                        <span className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <span className={styles.tooltipText}>
                            Rating that prioritizes highly rated, shorter games.
                            </span>
                        </span>
                        </div>
                    </div>

                    <div className={styles.stat}>
                        Metacritic: {game.metacritic_score ?? "N/A"}
                    </div>

                    <div className={styles.stat}>
                        Time to Beat: {game.hltb_score ? Number(game.hltb_score).toFixed(1) : "N/A"} hrs
                    </div>
                    </div>

                    <p className={styles.gameDescription}>{game.description}</p>

              </div>
            ))}
          </div>
    </section>
  )
}

export default LandingGames
