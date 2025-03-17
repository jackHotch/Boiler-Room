'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./Account.module.css";

const Account = () => {
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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


  //Handles the search mechanism with a call from the backend to the database
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

  //Attempt to highlight the option the user hovers over, or using arrow keys. Not functional. 
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0 // Wraps to first item
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1 // Wraps to last item
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleAddGame(searchResults[highlightedIndex]);
      setSearchTerm("");
      setSearchResults([]);
      setHighlightedIndex(-1);
    }
    else if (e.key === "Enter"){
      handleSearch();
    }
  };

  
  const handleMouseEnter = (index) => {
    setHighlightedIndex(index);
  };
  
  //Attempts to limit the games added to a maximum of 3. Not functional
  const handleAddGame = (game) => {
    setRecommendedGames((prevGames) => {
      if (prevGames.length < 3 && !prevGames.includes(game)) {
        return [...prevGames, game];
      }
      return prevGames; // If limit reached, do nothing
    });
  };
  
  //Removes the game when the remove button is clicked
  const handleRemoveGame = (game) => {
    setRecommendedGames((prevGames) => prevGames.filter((g) => g !== game));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Settings</h1>

      {/* Dark/Light Mode Slider, not functional */}
      <div className={styles.buttonContainer}>
          <button className={styles.removeButton}>Re-Sync</button> {/* CHRIS PUT IT H */}
      </div>

      {/* This div contains the search bar and the list of options that follow */}
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

        {/*Search results while there is a result */}
        {searchResults.length > 0 && (
          <ul className={styles.searchResults}>
          {searchResults.map((game, index) => (
            <li 
              key={index} 
              onClick={() => handleAddGame(game)} 
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`${styles.searchResultItem} ${highlightedIndex === index ? styles.highlighted : ""}`}
            >
              {game.name}
            </li>
          ))}
        </ul>

        )}
      </div>

        {/* Lists the games, with the buttons for removal */}
      <div className={styles.gameDisplaySection}>
        <div data-testid="recommended-games" className={styles.recommendedGames}>
          <h3 className={styles.title}>Your Recommended Games</h3>
          <div className={styles.gameList}>
            {recommendedGames.map((game, index) => (
              <div key={index} className={styles.gameItem}>
                <button onClick={() => handleRemoveGame(game)} className={styles.removeButton}>Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* This section is where the images are loaded */}
        <div className={styles.gameImageSection}>
           {/* List of game images */}
          {recommendedGames.map((game, index) => (
          <div key={index} className={styles.gameImageBlock}>
            <img 
              src={game.header_image} 
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

