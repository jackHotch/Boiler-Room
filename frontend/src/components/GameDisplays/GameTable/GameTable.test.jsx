import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import GameTable from "./GameTable";

const mockGames = [
    { game_id: "12345", name: "Game One", metacritic_score: 85, hltb_score: 10 },
    { game_id: "67890", name: "Game Two", metacritic_score: 78, hltb_score: 15 }
];

describe("GameTable Component", () => {
    test("renders table with correct headers", () => {
        render(<GameTable games={mockGames} />);
        
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Aggregate Rating")).toBeInTheDocument();
        expect(screen.getByText("Average Length")).toBeInTheDocument();
        expect(screen.getByText("BOIL")).toBeInTheDocument();
        expect(screen.getByText("Steam Page")).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("Played"))).toBeInTheDocument();
    });

    test("renders game rows correctly", () => {
        render(<GameTable games={mockGames} />);
        
        expect(screen.getByText("Game One")).toBeInTheDocument();
        expect(screen.getByText("Game Two")).toBeInTheDocument();
        expect(screen.getByText("85")).toBeInTheDocument();
        expect(screen.getByText("78")).toBeInTheDocument();
        expect(screen.getByText("10 Hrs")).toBeInTheDocument();
        expect(screen.getByText("15 Hrs")).toBeInTheDocument();
        
        const gameLinks = screen.getAllByRole("link", { name: /Game/ });
        expect(gameLinks).toHaveLength(mockGames.length);
        expect(gameLinks[0]).toHaveAttribute("href", "/SingleGame/12345");
        expect(gameLinks[1]).toHaveAttribute("href", "/SingleGame/67890");

        const steamLinks = screen.getAllByRole("link", { name: "Steam" });
        expect(steamLinks).toHaveLength(mockGames.length);
        expect(steamLinks[0]).toHaveAttribute("href", "https://store.steampowered.com/app/12345");
        expect(steamLinks[1]).toHaveAttribute("href", "https://store.steampowered.com/app/67890");

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(mockGames.length);
    });
});
