'use client'

import { useState } from "react";
import styles from './DashGameGallery.module.css';


const DashGameGallery = ({ games, categories }) => {

    const [enlargedId, setEnlargedId] = useState(1);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (index) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }));
    };

    const fallbackImage = "https://cdn2.steamgriddb.com/grid/786d203018e4c2e02516c19095af939e.jpg";

    return (
        <div className={styles.gallery}>
            {games.map((game, index) => (
                <div
                    key={index}
                    className={styles.gameContainer}
                    onMouseEnter={() => setEnlargedId(index)}
                >
                    <a href={'/SingleGame/' + game.game_id} className={styles.imageWrapper}>
                        {imageErrors[index] ? (
                            <div className={`${styles.placeholder} ${index === enlargedId ? styles.enlarged : ""}`}>
                                <img
                                    src={fallbackImage}
                                    className={index === enlargedId ? styles.enlarged : ""}
                                />
                                <p className={styles.placeholderText}>{game.name}</p>
                            </div>
                        ) : (
                            <img
                                src={"https://steamcdn-a.akamaihd.net/steam/apps/" + game.game_id + "/library_600x900_2x.jpg"}
                                alt={game.name}
                                className={`${styles.gameImage} ${index === enlargedId ? styles.enlarged : ""}`}
                                onError={() => handleImageError(index)}
                            />
                        )}
                    </a>
                    <p className={styles.gameTitle}>{categories[index].label}</p>
                </div>
            ))}
        </div>
    )
}
export default DashGameGallery;