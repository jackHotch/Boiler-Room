import React from 'react';
import styles from './Home.module.css';

const LandingPage = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.navContainer}>
                    <h1 className={styles.logo}>Boiler Room</h1>
                    <nav>
                        <ul className={styles.navList}>
                            <li><a href="#" className={styles.navLink}>Sign In</a></li>
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

            <section className={styles.featuredGames}>
                <h3 className={styles.sectionTitle}>Featured Games</h3>
                <div className={styles.gamesGrid}>
                    <div className={styles.gameCard}>
                        <img src="https://via.placeholder.com/300x200" alt="Game 1" className={styles.gameImage} />
                        <h4 className={styles.gameTitle}>Game Title 1</h4>
                        <p className={styles.gameDescription}>An exciting adventure awaits.</p>
                    </div>
                    <div className={styles.gameCard}>
                        <img src="https://via.placeholder.com/300x200" alt="Game 2" className={styles.gameImage} />
                        <h4 className={styles.gameTitle}>Game Title 2</h4>
                        <p className={styles.gameDescription}>Experience the thrill of action.</p>
                    </div>
                    <div className={styles.gameCard}>
                        <img src="https://via.placeholder.com/300x200" alt="Game 3" className={styles.gameImage} />
                        <h4 className={styles.gameTitle}>Game Title 3</h4>
                        <p className={styles.gameDescription}>A journey you won't forget.</p>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                &copy; 2025 Boiler Room. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
