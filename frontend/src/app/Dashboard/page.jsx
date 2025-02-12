import React from 'react';
import styles from './Dashboard.module.css';
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery';

export default function Dashboard() {
    
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
        </div>
);

}