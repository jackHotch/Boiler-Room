import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import GameTable from "./GameTable";

const mockGames = [
    { appId: "12345" },
    { appId: "67890" }
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
        
        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(mockGames.length);
        expect(links[0]).toHaveAttribute("href", expect.stringContaining(mockGames[0].appId));
        expect(links[1]).toHaveAttribute("href", expect.stringContaining(mockGames[1].appId));
        
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(mockGames.length);
    });
});
