// page.jsx
"use client";  // Add this at the top
import Select from "react-select";
import styles from './NewGameRecs.module.css';
import React, { useState } from "react";

export default function GameRecommendation() {
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
  

  const [selectedGenres, setSelectedGenres] = useState([]);

  const genreOptions = dbGenres.map((genre) => ({ value: genre, label: genre }));

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
    genre = selectedGenres.map(g => g.value);

    console.log("Form Data Submitted:");
    console.log({ minBoilRating, minYear, maxYear, platform, maxHLTB, genre});
    
    // filter errors and feedback
    let errors = "";
    if (minYear.length != 4 || maxYear.length != 4 || minYear < 1980 || maxYear < 1980 || 
    minYear > new Date().getFullYear() || maxYear > new Date().getFullYear() || minYear > maxYear || 
    maxHLTB < 0 || maxHLTB > 100 ||minBoilRating < 0 || minBoilRating > 100) 
    { 
      if (minYear.length != 4 || maxYear.length != 4) {errors += "Minimum/Maximum year is incorrect length - YYYY format.\n";}
      if (minYear < 1980 || maxYear < 1980) {errors += "Minimum/Maximum year is too old - min = 1980.\n";}
      if (minYear > new Date().getFullYear() || maxYear > new Date().getFullYear()) {errors += "Minimum/Maximum year is invalid - max year = current year.\n";}
      if (minYear > maxYear) {let swap = minYear; minYear = maxYear; maxYear = swap;} // swap minyear and maxyear if maxyear < minyear
      if (maxHLTB < 0 || maxHLTB > 100) {errors += "How Long to beat score invalid - 1 to 100.\n";}
      if (minBoilRating < 0 || minBoilRating > 100) {errors += "Boil Rating is invalid - 1 to 100.\n";}
      // ALERT CALL HERE
      window.alert("ERROR:\n" + errors);
    } 
    // else {
      // QUERY HERE JOHN
    // }
  
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
                <label>Max How Long To Beat: </label>
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
                <Select
                  isMulti
                  options={genreOptions}
                  value={selectedGenres}
                  onChange={setSelectedGenres}
                  className={styles.customSelect}
                  classNamePrefix="reactSelect"
                />
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