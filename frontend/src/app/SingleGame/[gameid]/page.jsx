'use client';
import React, { useEffect, useState } from 'react';
import styles from './SingleGame.module.css';
import { useParams } from 'next/navigation';

const SingleGamePage = () => {
  const { gameid } = useParams(); // Get game ID from dynamic route
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`http://localhost:8080/games/${gameid}`); // Backend route

        // Ensure the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON');
        }

        const data = await response.json();
        setGame(data);
      } catch (error) {
        console.error('Error fetching game details:', error);
        setError('Failed to load game details.');
      }
    };

    if (gameid) {
      fetchGame();
    }
  }, [gameid]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!game) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.singleGameContainer}>
      <h1 className={styles.gameTitle}>{game.name}</h1>
      <div className={styles.gameContent}>
        {/* Left Column */}
        <div className={styles.gameLeft}>
          <img className={styles.cover} src={"https://steamcdn-a.akamaihd.net/steam/apps/"+gameid+"/library_600x900_2x.jpg"} alt={game.name} />
          <div className={styles.gameInfo}>Number of recommendations: {game.recommendations}</div>
        </div>

        {/* Right Column */}
        <div className={styles.gameRight}>
          <div className={styles.gameSummary}>{game.description}</div>
          <div className={styles.ratings}>Metacritic Rating: {game.metacritic_score}/100</div>
          <div className={styles.reviews}>Release Date: {game.released}</div>
          <div className={styles.playStatus}>How long to Beat score: {game.hltb_score}</div>
          <div className={styles.writeReview}>Platforms: {game.platform}</div>
        </div>
      </div>
    </div>
  );
};

export default SingleGamePage;