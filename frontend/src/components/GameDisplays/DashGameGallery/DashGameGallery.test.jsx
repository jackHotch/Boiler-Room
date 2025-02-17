import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import DashGameGallery from "./DashGameGallery";

const mockGames = [
    { game_id: "753640", name: "Game One" },
    { game_id: "1145360", name: "Game Two" },
    { game_id: "632360", name: "Game Three" }
];

const mockCategories = [
    { label: "Quick Pick" },
    { label: "Acclaimed Classic" },
    { label: "Hidden Gem" }
];

describe("DashGameGallery Component", () => {
    test("renders game images and titles", () => {
        render(<DashGameGallery games={mockGames} categories={mockCategories} />);
        
        mockGames.forEach((game, index) => {
            expect(screen.getByAltText(game.name)).toBeInTheDocument();
            expect(screen.getByText(mockCategories[index].label)).toBeInTheDocument();
        });
    });

    test("renders correct image links", () => {
        render(<DashGameGallery games={mockGames} categories={mockCategories} />);
        
        mockGames.forEach((game) => {
            const link = screen.getByRole("link", { name: game.name });
            expect(link).toHaveAttribute("href", `/SingleGame/${game.game_id}`);
        });
    });

    test("updates enlarged state on hover", () => {
        render(<DashGameGallery games={mockGames} categories={mockCategories} />);
        
        const images = screen.getAllByRole("img");
        expect(images[1]).toHaveClass("enlarged");
        
        fireEvent.mouseEnter(images[2].closest("div"));
        expect(images[2]).toHaveClass("enlarged");
    });
});