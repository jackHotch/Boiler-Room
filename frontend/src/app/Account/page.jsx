'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./Account.module.css";

const Account = () => {
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(null);

  // Light/Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle between light and dark mode
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply light or dark mode styles when mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;
    try {
      const response = await axios.get(`http://localhost:8080/gamesByName?name=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.slice(0,10));
      console.log(response.data.slice(0,10));
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddGame = (game) => {
    console.log("Adding game:", game);
    if (recommendedGames.length < 3 && !recommendedGames.includes(game)) {
      setRecommendedGames([...recommendedGames, game]);
    }
  };

  const handleReplaceGame = (game) => {
    const updatedGames = [...recommendedGames];
    updatedGames[selectedGameIndex] = game;
    setRecommendedGames(updatedGames);
    setSelectedGameIndex(null);
  };

  const handleRemoveGame = (game) => {
    setRecommendedGames((prevGames) => prevGames.filter((g) => g !== game));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Settings</h1>

      {/* Dark/Light Mode Slider */}
      <div className={styles.toggleContainer}>
        <label className={styles.toggleSlider}>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={handleToggleDarkMode}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.searchRecs}>
        <h2 className={styles.title}>Recommend Games</h2>
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchBar}
        />

        {/* <select
          onChange={(e) => {handleAddGame(e.target.value);}}
          
          className={styles.gameDropdown}
        >
          <option value="">Select a game</option>
          {searchResults.map((game, index) => (
            <option key={index} value={game}>{game.name}</option>
          ))}
        </select> */}

        {searchResults.length > 0 && (
          <ul className={styles.searchResults}>
            {searchResults.map((game, index) => (
              <li key={index} onClick={() => handleAddGame(game)} className={styles.searchResultItem}>
                {game.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.gameDisplaySection}>
        <div className={styles.recommendedGames}>
          <h3 className={styles.title}>Your Selected Games</h3>
          <div className={styles.gameList}>
            {recommendedGames.map((game, index) => (
              <div key={index} className={styles.gameItem}>
                <span>{game.name}</span>
                <button onClick={() => handleRemoveGame(game)} className={styles.removeButton}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.gameImageSection}>
          {recommendedGames.length > 0 && (
            <h3>Selected Games</h3>
          )}
          {recommendedGames.map((game, index) => (
          <div key={index} className={styles.gameImageBlock}>
            {console.log("Image URL:", game.header_image)} {/* Debugging */}
            <img 
              src={
                game.header_image
              } 
              alt={game.name}
              className={styles.gameImagePlaceholder}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Account;

