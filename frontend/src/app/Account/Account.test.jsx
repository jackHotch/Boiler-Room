import '@testing-library/jest-dom'
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Account from "./page.jsx"; 
import axios from "axios";


// Mock axios calls
jest.mock("axios");

describe("Account Component", () => {

  test("renders Account component correctly", () => {
    render(<Account />);
    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("Recommend Games")).toBeInTheDocument();
  });

  // test("toggles dark mode", () => {
  //   render(<Account />);
  //   const toggle = screen.getByRole("checkbox");

  //   // Initial state should be unchecked
  //   expect(toggle).not.toBeChecked();

  //   // Click to enable dark mode
  //   fireEvent.click(toggle);
  //   expect(toggle).toBeChecked();

  //   // Click again to disable dark mode
  //   fireEvent.click(toggle);
  //   expect(toggle).not.toBeChecked();
  // });

  test("searches for games and displays results", async () => {
    const mockGames = [
      { name: "Counter-Strike", header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/10/header.jpg?t=1729702322" },
      { name: "Team Fortress Classic", header_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/20/header.jpg?t=1729702194" },
    ];

    axios.get.mockResolvedValueOnce({ data: mockGames });

    render(<Account />);
    const input = screen.getByPlaceholderText("Search for a game...");
    fireEvent.change(input, { target: { value: "t" } });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(await screen.findByText("Counter-Strike")).toBeInTheDocument();
    expect(await screen.findByText("Team Fortress Classic")).toBeInTheDocument();
  });

  test("adds a game to recommended list", async () => {
    render(<Account />);
  
    const mockGame = { name: "Test Game", header_image: "https://example.com/test.jpg" };
    axios.get.mockResolvedValueOnce({ data: [mockGame] });
  
    const input = screen.getByPlaceholderText("Search for a game...");
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.keyDown(input, { key: "Enter" });
  
    const gameOption = await screen.findByText("Test Game");
    fireEvent.click(gameOption);
  
    expect(screen.getByText("Test Game")).toBeInTheDocument();
  });
  

  test("prevents adding more than 3 games", async() => {
    render(<Account />);
    const games = [
      { name: "Game 1" },
      { name: "Game 2" },
      { name: "Game 3" },
      { name: "Game 4" },
    ];

    axios.get.mockResolvedValueOnce({ data: games });
  
    const input = screen.getByPlaceholderText("Search for a game...");
    fireEvent.change(input, { target: { value: "Game" } });
    fireEvent.keyDown(input, { key: "Enter" });
  
    //Attempt to add 4 games to the recommended list
    const gameOption = await screen.findByText("Game 1");
    fireEvent.click(gameOption);
    const gameOption2 = await screen.findByText("Game 2");
    fireEvent.click(gameOption2);
    const gameOption3 = await screen.findByText("Game 3");
    fireEvent.click(gameOption3);
    const gameOption4 = await screen.findByText("Game 4");
    fireEvent.click(gameOption4);

    
    //games.forEach((game) => fireEvent.click(screen.getByText(game.name)));

    // Ensure the game is NOT inside the recommendedGames div
    const recommendedGamesDiv = screen.getByTestId("recommended-games");
    expect(within(recommendedGamesDiv).queryByText("Test Game")).not.toBeInTheDocument();

  });

  test("removes a game from recommended list", async() => {
    render(<Account />);
    const mockGame = { name: "Test Game" };

    axios.get.mockResolvedValueOnce({ data: [mockGame] });

    const input = screen.getByPlaceholderText("Search for a game...");
    fireEvent.change(input, { target: { value: "Game" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const gameOption = await screen.findByText("Test Game");
    fireEvent.click(gameOption);
    const removeButton = await screen.findByText("Remove");
    fireEvent.click(removeButton);

    const recommendedGamesDiv = screen.getByTestId("recommended-games");
    expect(within(recommendedGamesDiv).queryByText("Test Game")).not.toBeInTheDocument();

  });

});
