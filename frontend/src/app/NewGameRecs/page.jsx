// page.jsx
"use client"  // Add this at the top
import styles from './NewGameRecs.module.css'
import React, { useState } from "react"
import axios from 'axios'

export default function GameRecommendation() {
  
  const [gameList, setGameList] = useState([]); // Store fetched games
  
  const dbGenres = ["Action","Strategy","RPG","Casual","Racing","Sports","Indie","Adventure",
    "Simulation","Massively Multiplayer","Free To Play","Accounting","Animation & Modeling",
    "Audio Production","Design & Illustration","Education","Photo Editing","Software Training",
    "Utilities","Video Production","Web Publishing","Game Development","Early Acess","Violent","Gore"]
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    let minBoilRating = parseFloat(event.target.minBoilRating.value) || -1;
    let minYear = event.target.minYear.value || '1970-01-01';
    let maxYear = event.target.maxYear.value || '2037-12-31';
    let platform = [
      event.target.option1.checked ? '4' : null,
      event.target.option3.checked ? '2' : null,
      event.target.option2.checked ? '1' : null,
    ].filter(option => option !== null);
    let maxHLTB = parseInt(event.target.maxHLTB.value, 10) || 10000;
    let genre = Array.from(event.target.genres.selectedOptions, option => option.value);



    if (platform.length === 0) platform = ["4", "2", "1"];

    try{
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + "/gamesByFilter",
        {params: 
          {minBoilRating, 
          minYear, 
          maxYear, 
          platform: platform.join(","), 
          genre: genre.join(","), 
          maxHLTB} 
        }
      )

      // Ensure the response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON')
      }

      //Get top 3 by boil rating - ordered by BR in results
      //Original 3 (without selecting anything) will have 3 games based on what user doesn't own,
      // we'll take a look at the release dates, platforms, genres, and maxhltb

      setGameList(response.data); // Store game list in state

    } catch (err){
      console.error(err);
    }
    console.log("GameList:",gameList);

    console.log("Form Data Submitted:");
    console.log({ minBoilRating, minYear, maxYear, platform, maxHLTB, genre});

   
  };

  return (
    <div className={styles.container}>
      <div className={styles.recommendedGames}>
      <div className={styles.filters}>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Boil Rating: </label>
                <input 
                  className={styles.tf}
                  type="text"
                  name="minBoilRating"
                  placeholder="Rating"
                />
              </div>
              <div>
                <label>Max HLTB: </label>
                <input 
                  className={styles.tf}
                  type="text"
                  name="maxHLTB"
                  placeholder="HLTB"
                />
              </div>
              <label>Year Range: </label>
              <div>
                <input 
                  className={styles.tfYear}
                  type="text"
                  name="minYear"
                  placeholder="XXXX"
                />
                <span> to </span>
                <input 
                  className={styles.tfYear}
                  type="text"
                  name="maxYear"
                  placeholder="XXXX"
                />
              </div>
              <label>Platform: </label>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" name="option1" id="option1" />
                <label htmlFor="option1" className={styles.checkbox}>Windows</label>

                <input type="checkbox" name="option2" id="option2" />
                <label htmlFor="option2" className={styles.checkbox}>Linux</label>

                <input type="checkbox" name="option3" id="option3" />
                <label htmlFor="option3" className={styles.checkbox}>Mac OS</label>
              </div>
              {/* Multi-Select Dropdown for Genres */}
              <div className={styles.genreDropdown}>
                <label>Select Genres:</label>
                <select name="genres" defaultValue="">
                  <option value="" disabled>Choose a genre</option>
                  {dbGenres.map((genre, index) => (
                    <option key={index} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={styles.submitBtn}>Submit</button>
            </form>
          </div> 
        <div className={styles.sectionTitle}>Recommended Games</div>
        <div className={styles.gamesGrid}>
          
          {/* Recommended games */}
          {gameList.length > 0 ? (
            gameList.slice(0, 3).map((game, index) => (
              <div key={index} className={styles.gameCard}>
                <img src={game.header_image} alt={game.name} className={styles.gameImage} />
                <p className={styles.gameTitle}>{game.name}</p>
              </div>
            ))
          ) : (
            <p>No games found. Try adjusting your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
