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
    expect(screen.getByText('Your Top Played Games')).toBeInTheDocument()
    expect(screen.getByText('Loading your games...')).toBeInTheDocument()
  })

  test('renders error state when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(screen.getByText('Your Top Played Games')).toBeInTheDocument()
      expect(
        screen.getByText('Failed to load owned games. Please log in with Steam.')
      ).toBeInTheDocument()
    })
  })

  test('renders games when API call succeeds', async () => {
    axios.get.mockResolvedValue({ data: mockGames })
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(screen.getByText('Your Top Rated Games')).toBeInTheDocument()
      expect(screen.queryByText('Loading your games...')).not.toBeInTheDocument()

      // Check game names and playtime
      expect(screen.getByText('Test Game 1')).toBeInTheDocument()
      expect(screen.getByText('Test Game 2')).toBeInTheDocument()
      expect(screen.getByText('Test Game 3')).toBeInTheDocument()

      expect(screen.getByText('20 Hours Played')).toBeInTheDocument() // 1200 minutes
      expect(screen.getByText('10 Hours Played')).toBeInTheDocument() // 600 minutes
      expect(screen.getByText('5 Hours Played')).toBeInTheDocument() // 300 minutes

      // Check boil scores
      expect(screen.getByText('Boil: 85')).toBeInTheDocument()
      expect(screen.getByText('Boil: 92')).toBeInTheDocument()
      expect(screen.getByText('Boil: 78')).toBeInTheDocument()

      // Check images
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(3)
      expect(images[0]).toHaveAttribute('src', 'test1.jpg')
      expect(images[1]).toHaveAttribute('src', 'test2.jpg')
      expect(images[2]).toHaveAttribute('src', expect.stringContaining('789/header.jpg'))

      // Check links
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
      expect(links[0]).toHaveAttribute('href', '/SingleGame/123')
      expect(links[1]).toHaveAttribute('href', '/SingleGame/456')
      expect(links[2]).toHaveAttribute('href', '/SingleGame/789')
    })
  })

  test('renders no games message when API returns empty array', async () => {
    axios.get.mockResolvedValue({ data: [] })
    render(<TopRatedGames />)

    await waitFor(() => {
      expect(screen.getByText('Your Top Rated Games')).toBeInTheDocument()
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

  test('limits display to 12 games when more are returned', async () => {
    const manyGames = Array(15)
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
      expect(images).toHaveLength(12) // Should only show 12 games despite 15 returned
    })
  })
})
