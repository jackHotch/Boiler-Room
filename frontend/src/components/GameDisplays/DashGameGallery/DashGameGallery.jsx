'use client'

import { useState } from "react";
import styles from './DashGameGallery.module.css';


const DashGameGallery = ({ games }) => {

    const [enlargedId, setEnlargedId] = useState(1);

    return (
        <div className={styles.gallery}>
            {games.map((game, index) => (
                <div
                    key={index}
                    className={styles.gameContainer}
                    onMouseEnter={() => setEnlargedId(index)}
                >
                    <img
                        src={game.cover}
                        className={index === enlargedId ? styles.enlarged : ""}
                    />
                    <p className={styles.gameTitle}>{game.label}</p>
                </div>
            ))}
        </div>
    )
}
export default DashGameGallery;