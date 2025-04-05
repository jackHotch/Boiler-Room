'use client'

import { useState, useEffect } from 'react'
import styles from './LandingGames.module.css'

const LandingGames = ({ games, categories }) => {
  const [imageErrors, setImageErrors] = useState({})
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadingImages, setLoadingImages] = useState(true)

  useEffect(() => {
    // Preload images before rendering
    const preloadImages = () => {
      const imageUrls = games.map(
        (game) =>
          `https://steamcdn-a.akamaihd.net/steam/apps/${game.game_id}/library_600x900_2x.jpg`
      )

      const loadPromises = imageUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = url
          img.onload = () => resolve(index)
          img.onerror = () => reject(index)
        })
      })

      Promise.allSettled(loadPromises)
        .then((results) => {
          const failedImages = results.filter((result) => result.status === 'rejected')
          if (failedImages.length > 0) {
            // Handle failed image loading if necessary
            console.warn(`${failedImages.length} images failed to load.`)
          }

          // Introduce a small delay before showing the images
          setTimeout(() => {
            setImagesLoaded(true) // Once all images are loaded, show them
            setLoadingImages(false) // Stop showing loading state
          }, 500) // Delay of 500ms before showing content
        })
        .catch((error) => {
          console.error('Error loading images:', error)
          setImagesLoaded(true) // Proceed even if some images fail
          setLoadingImages(false)
        })
    }

    if (games.length > 0) {
      preloadImages()
    }
  }, [games])

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <section className={styles.featuredGames}>
          <h3 className={styles.sectionTitle}>Featured Games</h3>
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <div key={index} className={styles.gameCard}>
                {/* Link to the game's Steam page */}
                <a href={`/SingleGame/${game.game_id}`}>
                  <img
                    src={game.header_image}
                    alt={game.name}
                    className={styles.gameImage}
                  />
                </a>
                <h4 className={styles.gameTitle}>{game.name}</h4>
                <p className={styles.gameDescription}>{game.description}</p>
              </div>
            ))}
          </div>
    </section>
  )
}

export default LandingGames
