import React from 'react';
import styles from './Dashboard.module.css';
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery';
import GameTable from '@/components/GameDisplays/GameTable/GameTable';

export default function Dashboard() {
    
    {/*some placeholder games for now*/}
    const featuredGames = [
    {cover:"https://steamcdn-a.akamaihd.net/steam/apps/753640/library_600x900_2x.jpg", label : "Quick Pick"},
    {cover:"https://steamcdn-a.akamaihd.net/steam/apps/632360/library_600x900_2x.jpg", label : "Acclaimed Classic"},
    {cover:"https://steamcdn-a.akamaihd.net/steam/apps/1145360/library_600x900_2x.jpg", label : "Hidden Gem"}
    ]
    
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Dashboard</h1>
            <section className={styles.featuredGames}>
                <DashGameGallery games={featuredGames}/>
            </section>
            <section className={styles.otherGames}>
                <GameTable games="placeholder"/> {/*change value of games when available*/}
            </section>
        </div>
);

}