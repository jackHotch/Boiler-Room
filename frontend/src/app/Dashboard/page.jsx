import React from 'react';
import styles from './Dashboard.module.css';
import DashGameGallery from '@/components/GameDisplays/DashGameGallery/DashGameGallery';
import GameTable from '@/components/GameDisplays/GameTable/GameTable';

export default function Dashboard() {
    
    {/*A component for some filters should eventually go here*/}


    {/*some placeholder games for now*/}
    const games = [
        {appId:753640},
        {appId:1145360},
        {appId:632360}
    ]

    const featuredGames = games.slice(0,3); {/*use the first 3 games for featured games*/}

    {/*some example/potential default categories for the featured games, 
        can be changed according to user prefs*/}
    const featuredCategories = [
        {label : "Quick Pick"},
        {label : "Acclaimed Classic"},
        {label : "Hidden Gem"}
    ]
    
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Dashboard</h1>
            <section className={styles.featuredGames}>
                <DashGameGallery games={featuredGames} categories={featuredCategories}/>
            </section>
            <section className={styles.otherGames}>
                <GameTable games={games}/> {/*change value of games when available*/}
            </section>
        </div>
);

}