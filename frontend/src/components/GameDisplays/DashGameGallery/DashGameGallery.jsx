'use client'

import { useState, useEffect } from 'react'
import styles from './DashGameGallery.module.css'

const DashGameGallery = ({ games, categories }) => {
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
    <div className={styles.gallery}>
      {loadingImages ? (
        <p>Loading gallery...</p>
      ) : (
        games.map((game, index) => {
          const isMiddle = games.length === 3 && index === 1 // Check if it's the middle game

          return (
            <div
              key={index}
              className={`${styles.gameContainer} ${isMiddle ? styles.enlarged : ''}`}
            >
              <p className={styles.gameCategory}>{categories[index].label}</p>

              <a href={'/SingleGame/' + game.game_id} className={styles.imageWrapper}>
                <div className={styles.imageContainer}>
                  {imageErrors[index] || !imagesLoaded ? (
                    <div className={styles.placeholder}>
                      <img
                        src={`https://placehold.co/600x900/3145/white/?text=${game.name}&font=lobster`}
                        alt={`Placeholder for ${game.name}`}
                        className={styles.gameImage}
                      />
                    </div>
                  ) : (
                    <img
                      src={game.header_image}
                      alt={game.name}
                      className={styles.gameImage}
                      onError={() => handleImageError(index)}
                    />
                  )}
                </div>
              </a>
              <p className={styles.gameName}>{game.name}</p>
            </div>
          )
        })
      )}
    </div>
  )
}

export default DashGameGallery
