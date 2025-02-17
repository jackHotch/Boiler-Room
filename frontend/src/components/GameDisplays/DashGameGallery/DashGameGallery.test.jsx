import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import DashGameGallery from "./DashGameGallery";

const mockGames = [
    { appId: "12345" },
    { appId: "67890" },
    { appId: "440" }
];

const mockCategories = [
    { label: "Action" },
    { label: "Adventure" },
    { label: "Puzzle" }
];

describe("DashGameGallery Component", () => {
    test("renders game gallery with images and titles", () => {
        render(<DashGameGallery games={mockGames} categories={mockCategories} />);
        
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Adventure")).toBeInTheDocument();
        expect(screen.getByText("Puzzle")).toBeInTheDocument();
        
        const images = screen.getAllByRole("img");
        expect(images).toHaveLength(mockGames.length);
        expect(images[0]).toHaveAttribute("src", expect.stringContaining(mockGames[0].appId));
        expect(images[1]).toHaveAttribute("src", expect.stringContaining(mockGames[1].appId));
        expect(images[2]).toHaveAttribute("src", expect.stringContaining(mockGames[2].appId));
    });

    test("updates enlarged state on hover", () => {
        render(<DashGameGallery games={mockGames} categories={mockCategories} />);
        
        const images = screen.getAllByRole("img");
        expect(images[0]).not.toHaveClass("enlarged");
        expect(images[1]).toHaveClass("enlarged");
        expect(images[2]).not.toHaveClass("enlarged");
        
        fireEvent.mouseEnter(images[2].closest("div"));
        
        expect(images[2]).toHaveClass("enlarged");
    });
});