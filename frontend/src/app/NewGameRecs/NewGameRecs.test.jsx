import React from "react";
import { render, screen } from "@testing-library/react";
import NewGameRecs from "./page";
import { TextEncoder, TextDecoder } from "util";
import axios from "axios";
import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock("axios");

// Avoid real requests by resolving empty responses
beforeEach(() => {
  axios.get.mockImplementation(() => Promise.resolve({ data: 
    [
      {
        "most_common_genre": ["Action"],
        "genre_count": 10,
        "most_common_platform": [4],
        "avg_hltb": 18
      }
    ]
   }));
});

describe("NewGameRecs Component - UI Rendering", () => {
  it("renders the page title", async () => {
    render(<NewGameRecs />);
    expect(await screen.findByText("Handpicked For You")).toBeInTheDocument();
  });

  it("renders the genre selection label", async () => {
    render(<NewGameRecs />);
    expect(await screen.findByText("Select Genres:")).toBeInTheDocument();
  });

  it("renders the submit button", async () => {
    render(<NewGameRecs />);
    expect(await screen.findByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  

  it("renders the platform filter label", async () => {
    render(<NewGameRecs />);
    expect(await screen.findByText("Platform:")).toBeInTheDocument();
  });
});
