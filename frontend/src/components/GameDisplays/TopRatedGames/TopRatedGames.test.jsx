import { render, screen, waitFor } from '@testing-library/react'
import TopRatedGames from './TopRatedGames'
import axios from 'axios'
import '@testing-library/jest-dom'

// Mock the CSS module
jest.mock('./TopRatedGames.module.css', () => ({
  scrollContainer: 'scrollContainer',
  gridContainer: 'gridContainer',
  imageWrapper: 'imageWrapper',
  gameImage: 'gameImage',
  gameTitle: 'gameTitle',
  loadingText: 'loadingText',
  errorText: 'errorText',
  boil_score: 'boil_score',
}))

// Mock axios
jest.mock('axios')

describe('TopRatedGames', () => {
  const mockGames = [
    {
      id: '123',
      name: 'Test Game 1',
      total_played: 1200,
      header_image: 'test1.jpg',
      boil_score: 85,
    },
    {
      id: '456',
      name: 'Test Game 2',
      total_played: 600,
      header_image: 'test2.jpg',
      boil_score: 92,
    },
    {
      id: '789',
      name: 'Test Game 3',
      total_played: 300,
      boil_score: 78,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variable
    process.env.NEXT_PUBLIC_BACKEND = 'http://localhost:8080'
  })

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})) // Pending promise for loading state
    render(<TopRatedGames />)
    expect(screen.getByText('Try These Highly Rated Titles Next')).toBeInTheDocument()
    expect(screen.getByText('Loading your games...')).toBeInTheDocument()
  })

  test('renders error state when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(screen.getByText('Try These Highly Rated Titles Next')).toBeInTheDocument()
      expect(
        screen.getByText('Failed to load owned games. Please log in with Steam.')
      ).toBeInTheDocument()
    })
  })

  test('renders no games message when API returns empty array', async () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(screen.getByText('Try These Highly Rated Titles Next')).toBeInTheDocument()
      expect(screen.getByText('No owned games to display')).toBeInTheDocument()
    })
  })

  test('makes correct API call with credentials', async () => {
    axios.get.mockResolvedValue({ data: mockGames })
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/usergames', {
        withCredentials: true,
      })
    })
  })

  test('limits display to 24 games when more are returned', async () => {
    const manyGames = Array(30)
      .fill()
      .map((_, i) => ({
        id: `${i}`,
        name: `Game ${i}`,
        total_played: 600,
        boil_score: 80,
      }))
    axios.get.mockResolvedValue({ data: manyGames })
    render(<TopRatedGames />)

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(24) // Should only show 12 games despite 15 returned
    })
  })
})
