'use client'

import { useState } from "react";
import styles from './DashGameGallery.module.css';


const DashGameGallery = ({ games, categories }) => {

    const [enlargedId, setEnlargedId] = useState(1);

    return (
        <div className={styles.gallery}>
            {games.map((game, index) => (
                <div
                    key={index}
                    className={styles.gameContainer}
                    onMouseEnter={() => setEnlargedId(index)}
                >
                    <a href={'/SingleGame/' + game.game_id}>
                    <img
                        src={"https://steamcdn-a.akamaihd.net/steam/apps/"+game.game_id+"/library_600x900_2x.jpg"}
                        alt={game.name}
                        className={index === enlargedId ? styles.enlarged : ""}
                    />
                    </a>
                    <p className={styles.gameTitle}>{categories[index].label}</p>
                </div>
            ))}
        </div>
    )
}
export default DashGameGallery;