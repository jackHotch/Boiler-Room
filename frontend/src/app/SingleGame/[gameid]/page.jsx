'use client'
import React, { useEffect, useState } from 'react'
import styles from './SingleGame.module.css'
import { useParams } from 'next/navigation'
import axios from 'axios'

const SingleGamePage = () => {
  const { gameid } = useParams()
  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + `/games/${gameid}`
        )

        const contentType = response.headers['content-type']
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON')
        }
        response.data.description = response.data.description.replaceAll('&quot;', '"')
        response.data.description = response.data.description.replaceAll('&amp;', '&')
        setGame(response.data)
      } catch (error) {
        console.error('Error fetching game details:', error)
        setError('Failed to load game details.')
      }
    }

    if (gameid) {
      fetchGame()
    }
  }, [gameid])

  // Start the Progress Bar fully Empty
  const [animatedOffset, setAnimatedOffset] = useState(314) // For Steam Reviews
  const [animatedOffset2, setAnimatedOffset2] = useState(314) // For Metacritic Score
  const [animatedOffset3, setAnimatedOffset3] = useState(314) // For Boil Rating

  // Ensure that game is not null before accessing its properties
  let reviewRatio = game ? Math.round((game.positive / game.total) * 100) : 0

  // Circular Progress Function
  const getStrokeDashOffset = (score) => {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    let strokeDash = circumference - (score / 100) * circumference

    return strokeDash
  }

  // Trigger the Animation when the page loads
  useEffect(() => {
    setTimeout(() => {
      setAnimatedOffset(getStrokeDashOffset(reviewRatio))
      if (game.metacritic_score)
        setAnimatedOffset2(getStrokeDashOffset(game.metacritic_score))

      if (game.boil_score) setAnimatedOffset3(getStrokeDashOffset(game.boil_score))
    }, 300) // Added Delay for a smoother animation

    setTimeout(() => {}, 300)

    setTimeout(() => {}, 300)
  }, [reviewRatio, game?.metacritic_score, game?.boil_score]) // Trigger animation when reviewRatio updates

  // Added a Function to determine the color of the progress bar
  const getStrokeColor = (score) => {
    if (score >= 70) return 'Green'
    if (score >= 40) return 'Yellow'
    return 'Red'
  }

  return error ? (
    <div className={styles.error}>{error}</div>
  ) : !game ? (
    <div className={styles.loading}>Loading...</div>
  ) : (
    <div className={styles.singleGameContainer}>
      <div className={styles.gameContent}>
        {/* Left Column */}
        <div className={styles.gameLeft}>
          <div className={styles.imageContainer}>
            <img
              src={`https://steamcdn-a.akamaihd.net/steam/apps/${gameid}/library_600x900_2x.jpg`}
              alt={game.name}
              onError={(e) => {
                e.target.src = `https://placehold.co/600x900/black/white/?text=${game.name}&font=lobster`
              }}
            />
          </div>

          <div className={styles.releaseDate}>
            Release Date: {game.released ? game.released : 'Price Not Available'}
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.gameRight}>
          <div className={styles.titlePrice}>
            <a target='_blank' href={'https://store.steampowered.com/app/' + gameid}>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png'
                className={styles.redirectImage}
                alt='Redirect'
              />
            </a>
            <a className={styles.gameTitle}>{game.name} |</a>
            <div className={styles.price}>
              {game.price ? '$' + game.price : 'Not Available'}
            </div>
          </div>

          <div className={styles.gameSummary}>
            {game.description ? game.description : 'No description available.'}
          </div>
          <div className={styles.reviews}>
            <strong>Steam Reviews</strong>
            <strong className={styles.questionMark}> ?</strong>
            <br />
            <br />
            <span className={styles.numReviews}>
              <strong>
                Total Reviews: {game.total} <br />
                Positive Reviews: {game.positive} <br />
                Negative Reviews: {game.negative} <br />
                {game.recommendation_description}
              </strong>
            </span>
            <div className={styles.circleContainer}>
              <svg className={styles.progressRing} width='120' height='120'>
                <circle className={styles.progressRingBg} cx='60' cy='60' r='50'></circle>
                <circle
                  className={styles.progressRingCircle}
                  cx='60'
                  cy='60'
                  r='50'
                  style={{
                    strokeDasharray: 314,
                    strokeDashoffset: animatedOffset,
                    stroke: getStrokeColor(reviewRatio),
                  }}
                ></circle>
              </svg>
              <span className={styles.progressText}>
                {reviewRatio ? `${reviewRatio}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className={styles.metacritic_score}>
            <strong>Metacritic Score</strong>
            <br />
            <br />
            <div className={styles.circleContainer}>
              <svg className={styles.progressRing} width='120' height='120'>
                <circle className={styles.progressRingBg} cx='60' cy='60' r='50'></circle>
                <circle
                  className={styles.progressRingCircle}
                  cx='60'
                  cy='60'
                  r='50'
                  style={{
                    strokeDasharray: 314,
                    strokeDashoffset: animatedOffset2,
                    stroke: getStrokeColor(game.metacritic_score),
                  }}
                ></circle>
              </svg>
              <a className={styles.progressText}>
                {game.metacritic_score ? `${game.metacritic_score}%` : 'N/A'}
              </a>
            </div>
          </div>

          <div className={styles.platforms}>
            <strong>Platforms</strong>
            <br />
            <br />
            {game.platform ? game.platform : 'N/A'}
          </div>

          <div className={styles.boil}>
            <strong>Boil Rating</strong>
            <strong className={styles.questionMark}> ?</strong>

            <br />
            <br />
            <span className={styles.boil_score}>
              <strong>Rating that prioritizes highly rated, shorter games.</strong>
            </span>
            <div className={styles.circleContainer}>
              <svg className={styles.progressRing} width='120' height='120'>
                <circle className={styles.progressRingBg} cx='60' cy='60' r='50'></circle>
                <circle
                  className={styles.progressRingCircle}
                  cx='60'
                  cy='60'
                  r='50'
                  style={{
                    strokeDasharray: 314,
                    strokeDashoffset: animatedOffset3,
                    stroke: getStrokeColor(game.boil_score),
                  }}
                ></circle>
              </svg>
              <span className={styles.progressText}>
                {game.boil_score ? `${game.boil_score}%` : 'N/A'}
              </span>
            </div>
          </div>

          <div className={styles.hltb_score}>
            <strong>How Long to Beat</strong>
            <strong className={styles.questionMark}> ?</strong>
            <span className={styles.tooltipText}>
              <strong>
                The Average of the <br />
                Main Story & Main Story + Extras <br />
              </strong>
              howlongtobeat.com{' '}
            </span>
            <br />
            <br />
            {game.hltb_score ? `${Math.floor(game.hltb_score)} hours` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleGamePage
