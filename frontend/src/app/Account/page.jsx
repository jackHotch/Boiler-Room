'use client'
import React, { useState } from 'react';
import axios from 'axios';
import styles from "./Account.module.css";

const Account = () => {
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Store fetched games

  // Function to fetch games based on search term
  const handleSearch = async () => {
    if (searchTerm.trim() === "") return; // Don't search if input is empty
    try {
      console.log(`/games?name=${encodeURIComponent(searchTerm)}`);
      const response = await axios.get(`http://localhost:8080/games?name=${encodeURIComponent(searchTerm)}`);         //NEEDS TO CHANGE ONCE DEPLOYED, LOCALHOST WILL NOT WORK
      setSearchResults(response.data); // Store matching games
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  // Function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();  // Trigger search when Enter key is pressed
    }
  };

  const handleAddGame = (game) => {
    if (recommendedGames.length < 3 && !recommendedGames.includes(game)) {
      setRecommendedGames([...recommendedGames, game]);
    }
  };

  const handleRemoveGame = (game) => {
    setRecommendedGames((prevGames) => prevGames.filter((g) => g !== game));
  };

  return (
    <div className="container">
      <h1 className="title">Account Settings</h1>
      <button className="toggle-button">Toggle Dark/Light Mode</button>

      <div className="search-recs">
        <h2 className="title">Recommend Games</h2>
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term
          onKeyDown={handleKeyDown} // Wait for Enter key
          className="search-bar"
        />

        {/* Display search results */}
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((game, index) => (
              <li key={index} onClick={() => handleAddGame(game.name)} className="search-result-item">
                {game.name}
              </li>
            ))}
          </ul>
        )}

        <div className="recommended-games">
          {recommendedGames.map((game, index) => (
            <div key={index} className="game-item">
              <span>{game}</span>
              <button onClick={() => handleRemoveGame(game)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Game Image Blocks */}
      <div className="game-image-section">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="game-image-block">
            {recommendedGames[index] ? (
              <img
                src={game.header_image} 
                alt={recommendedGames[index]}
                className="game-image-placeholder"
              />
            ) : (
              <div className="empty-placeholder">No game selected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account;
