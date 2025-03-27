// page.jsx
"use client";  // Add this at the top
import styles from './NewGameRecs.module.css';
import React, { useState } from "react";
import axios from 'axios'

export default function GameRecommendation() {
  //Function to check for login and redirect
  //to error page if not logged in
  if (!process.env.JEST_WORKER_ID) {
    checkLogin()
  }
  async function checkLogin() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
        { withCredentials: true }
      )
      if (!response.data.steamId) {
        //redirect to error page if not logged in
          window.location.href = '/LoginRedirect';
      }
    } catch (error) {
      window.location.href = '/LoginRedirect';
    }
  }
  
  let minBoilRating;
  let minYear;
  let maxYear;
  let platform;
  let genre;
  let maxHLTB;

  const dbGenres = ["Action","Strategy","RPG","Casual","Racing","Sports","Indie","Adventure",
    "Simulation","Massively Multiplayer","Free To Play","Accounting","Animation & Modeling",
    "Audio Production","Design & Illustration","Education","Photo Editing","Software Training",
    "Utilities","Video Production","Web Publishing","Game Development","Early Acess","Violent","Gore"]
  
  const handleSubmit = (event) => {
    event.preventDefault();

    minBoilRating = event.target.minBoilRating.value;
    minYear = event.target.minYear.value;
    maxYear = event.target.maxYear.value;
    platform = [
      event.target.option1.checked ? '4' : null,
      event.target.option2.checked ? '1' : null,
      event.target.option3.checked ? '2' : null,
    ].filter(option => option !== null); // Remove null values
    maxHLTB = event.target.maxHLTB.value;
    genre = Array.from(event.target.genres.selectedOptions, option => option.value);

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
          <div className={styles.gameCard}></div>
          <div className={styles.gameCard}></div>
          <div className={styles.gameCard}></div>
        </div>
      </div>
    </div>
  );
}
