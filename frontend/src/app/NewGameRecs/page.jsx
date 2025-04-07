// page.jsx
"use client"  // Add this at the top
import styles from './NewGameRecs.module.css'
import React, { useEffect, useState } from "react"
import axios from 'axios'
import Select from "react-select";

export default function GameRecommendation() {
  
  const [gameList, setGameList] = useState([]); // Store fetched games
  const [userStats, setUserStats] = useState([]); //Stores User default preferences
  const [steamId, setSteamId] = useState(null); //Stores user's steamId
  const dbGenres = ["Action","Strategy","RPG","Casual","Racing","Sports","Indie","Adventure",
    "Simulation","Massively Multiplayer","Free To Play","Accounting","Animation & Modeling",
    "Audio Production","Design & Illustration","Education","Photo Editing","Software Training",
    "Utilities","Video Production","Web Publishing","Game Development","Early Acess","Violent","Gore"];
  

  const [selectedGenres, setSelectedGenres] = useState([]);

  const genreOptions = dbGenres.map((genre) => ({ value: genre, label: genre }));

  //User game specs (avg game length, genre, platform)
  useEffect(() => {
    console.log("Retrieving game Specs");
    const fetchUserStats = async () => {
      //Recording steamId in global variable first
      try {
        const steamIdResponse = await axios.get(process.env.NEXT_PUBLIC_BACKEND + "/steam/logininfo", { withCredentials: true });
        const steamIdValue = steamIdResponse.data.steamId; // Extract actual ID
        setSteamId(steamIdValue);

        console.log("Steam ID Response:", steamIdResponse.data.steamId);
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + "/userGameSpecs",
          {
            withCredentials: true,
            params: { steamId: steamIdResponse.data.steamId }
          }
        );
        
        console.log("Retrieved game specs");
        console.log("Game Specs response:", response.data);
        setUserStats(response.data);
        fetchRecommendedGames(response.data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, []); // Runs once when the component mounts


  // Fetch recommended games after user stats are loaded
  // useEffect(() => {
    
  //   if (userStats) {
  //     console.log("Fetching recommendations");
  //     fetchRecommendedGames(userStats);
  //   }else{
  //     console.log("no userStats");
  //   }
  // }, [userStats]); // Runs when userStats is set

  const fetchRecommendedGames = async (stats) => {
    console.log("From fetchRecommendedGames:");
    console.log(stats);
    console.log("Genre:",stats[0].most_common_genre,"Count:",stats[0].genre_count,"Platform",stats[0].most_common_platform,"HLTB:",stats[0].avg_hltb);
    const params = {
      minBoilRating: -1, // Default value
      minYear: "1970-01-01",
      maxYear: "2037-12-31",
      platform: [stats[0].most_common_platform], // Use the most played platform
      genre: [stats[0].most_common_genre], // Use the most played genre
      maxHLTB: (Math.round(stats[0].avg_hltb) + 15) || "10000", // Default if no data, game length is maxed to 15 hours plus the average
      steamId
    };

    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + "/gamesByFilter",
        {
          withCredentials: true,
          params
        }
      );

      console.log("Fetched recommendations");
      console.log("Full API Response:", response.data);
      setGameList(response.data);
      //console.log("Updated GameList: ",gameList); //not updated immediately
    } catch (error) {
      console.error("Error fetching recommended games:", error);
    }
  };

  // useEffect(() => {
  //   console.log("Updated GameList:", gameList);
  // }, [gameList]);  // ✅ Logs every time `gameList` updates
  


    //Submitting filtering options, changes games recommended
  const handleSubmit = async (event) => {
    event.preventDefault();

    let minBoilRating = parseFloat(event.target.minBoilRating.value) || -1;
    let minYear = event.target.minYear.value || '1970-01-01';
    let maxYear = event.target.maxYear.value || '2037-12-31';
    let platform = [
      event.target.option1.checked ? 4 : null,
      event.target.option3.checked ? 2 : null,
      event.target.option2.checked ? 1 : null,
    ].filter(option => option !== null);
    let maxHLTB = parseInt(event.target.maxHLTB.value, 10) || 10000;
    let genre = selectedGenres.map(g => g.value); 
    console.log("Genres:",genre);
    console.log("Genres.join:",genre.join(","));
    if (platform.length === 0) platform = [4, 2, 1];

    try{
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + "/gamesByFilter",
        {
          withCredentials: true,
          params: 
          {minBoilRating, 
          minYear, 
          maxYear, 
          platform, 
          genre, 
          maxHLTB,
          steamId} 
        }       
      )

      // Ensure the response is JSON
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }                                                             ///////////////////////////////////////////////////      

      setGameList(response.data); // Store game list in state

    } catch (err){
      console.error(err);
    }
    console.log("GameList:",gameList);

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
        <div className={styles.sectionTitle}>Handpicked For You</div>
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