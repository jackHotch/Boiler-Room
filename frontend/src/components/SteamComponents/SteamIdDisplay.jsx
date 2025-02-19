"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "@/components/SteamComponents/Login";
import Logout from "@/components/SteamComponents/Logout";

export default function SteamIdDisplay() {
  const [steamId, setSteamId] = useState(null);
  const [steamName, setSteamName] = useState(null);
  const [steamPFP, setPFP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + "/steam/getdisplayinfo",
          {
            withCredentials: true,
          }
        );

        console.log("Response Data:", response.data);
        setSteamId(response.data.steamId);
        setSteamName(response.data.steamName);
        setPFP(response.data.steamPFP);

        if (response.data.steamId === null) setError("Not Logged In");
      } catch (error) {
        console.error("Error fetching Steam ID:", error);
        setError("Not Logged In");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

 return (
  <div className="steamProfileDisplay" style={styles.container}>
    <div style={styles.infoContainer}>
      {loading ? (
        <p style={styles.loadingText}>Loading Steam data...</p>
      ) : error ? (
        <>
          <p style={styles.errorText}>{error}</p>
          <Login />
        </>
      ) : (
        <>
          <div style={styles.profileWrapper}>
            <img src={steamPFP} alt="Steam Profile Picture" style={styles.profileImage} />
            <div style={styles.textContainer}>
              <p style={styles.steamName}>
                <strong>{steamName}</strong>
              </p>
              <p style={styles.steamId}>
                <strong>Steam ID: {steamId}</strong>
              </p>
            </div>
          </div>
          <Logout />
        </>
      )}
    </div>
  </div>
);

}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "100%",
    right: "0%",
    zIndex: 100000,
  },
  infoContainer: {
    background: "rgba(0, 0, 0, 0.6)", 
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)", 
    padding: "20px",
    textAlign: "center",
    width: "320px",
    border: "1px solid rgba(255, 255, 255, 0.2)", 
  },
  profileWrapper: {
    display: "flex", // Align the profile image and text horizontally
    alignItems: "center", // Vertically center the items
    marginBottom: "10px",
  },
  profileImage: {
    width: "80px",
    height: "80px",
    borderRadius: "50%", // Make it circular
    marginRight: "10px", // Add space between the image and text
    border: "2px solid white",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Center the text vertically
    alignItems: "flex-start", // Align text to the left
  },
  loadingText: {
    fontSize: "18px",
    color: "#bbb",
  },
  errorText: {
    fontSize: "18px",
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  steamId: {
    fontSize: "12px",
    color: "#fffa",
    margin: "8px 0",
  },
  steamName: {
    fontSize: "16px",
    color: "#fff",
    margin: "8px 0",
  },
};
