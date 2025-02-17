import { render, screen } from "@testing-library/react";
import SingleGamePage from "./page.jsx";
import { useParams } from "next/navigation";

// Mock useParams to return a game ID
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        id: "1",
        name: "Test Game",
        description: "This is a test game.",
      }),
  })
);

describe("SingleGamePage", () => {
  it("renders correctly with a game ID", async () => {
    // Mock game ID
    useParams.mockReturnValue({ gameid: "1" });

    render(<SingleGamePage />);

    // Ensure fetch is called with the correct URL
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/games/1"));

  });
});