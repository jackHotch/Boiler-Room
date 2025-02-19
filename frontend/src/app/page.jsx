'use client'
import React, {useEffect, useState} from 'react';
import styles from './Home.module.css';

const LandingPage = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:8080/games'); // Use the backend port
    
        // Ensure the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON');
        }
    
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching game images:', error);
      }
    };
    fetchGames();
  }, []);

    return (
        <div className={styles.container}>  
            <header className={styles.header}>
                <div className={styles.navContainer}>
                    <h1 className={styles.logo}>Boiler Room</h1>
                    <nav>
                        <ul className={styles.navList}>
                            <li><a href="http://localhost:8080/auth/steam" className={styles.navLink}>Sign In</a></li>
                            <li><a href="#" className={styles.navLink}>Sign Up</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <section className={styles.hero}>
                <div className={styles.heroOverlay}>
                    <div className={styles.heroContent}>
                        <h2 className={styles.heroTitle}>Welcome to Boiler Room</h2>
                        <p className={styles.heroSubtitle}>Discover, play, and share amazing games.</p>
                        <a href="#" className={styles.exploreButton}>Explore Now</a>
                    </div>
                </div>
            </section>
            {/*Dynamically Update the featured games section to display 3 random games from the data base.*/}
            <section className={styles.featuredGames}>
                <h3 className={styles.sectionTitle}>Featured Games</h3>
                <div className={styles.gamesGrid}>
                    {games.map((game, index) => (
                        <div key={index} className={styles.gameCard}>
                          {/* Link to the game's Steam page */}
                          <a href = {`http://localhost:3000/SingleGame/${game.game_id}`}> 
                            <img src={game.header_image} alt={game.name} className={styles.gameImage} />
                          </a>
                            <h4 className={styles.gameTitle}>{game.name}</h4>
                            <p className={styles.gameDescription}>{game.description}</p>
                        </div>
                    ))}
                </div>
            </section>

<footer className={styles.footer}> &copy; 2025 Boiler Room. All rights reserved.</footer>
        </div>
    );
};

export default LandingPage;
