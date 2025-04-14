import { render, screen, waitFor } from '@testing-library/react'
import OwnedGamesGallery from './OwnedGamesGallery'
import axios from 'axios'
import '@testing-library/jest-dom'

// Mock the CSS module
jest.mock('./OwnedGamesGallery.module.css', () => ({
  scrollContainer: 'scrollContainer',
  gridContainer: 'gridContainer',
  imageWrapper: 'imageWrapper',
  gameImage: 'gameImage',
  gameTitle: 'gameTitle',
  loadingText: 'loadingText',
  errorText: 'errorText',
}))

// Mock axios
jest.mock('axios')

describe('OwnedGamesGallery', () => {
  const mockGames = [
    {
      id: '123',
      title: 'Test Game 1',
      playtime_2weeks: 1200,
      header_image: '/redirect.png',
    },
    {
      id: '456',
      title: 'Test Game 2',
      playtime_2weeks: 600,
      header_image: '/redirect.png',
    },
    { id: '789', title: 'Test Game 3', playtime_2weeks: 300 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variable
    process.env.NEXT_PUBLIC_BACKEND = 'http://localhost:8080'
  })

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})) // Pending promise for loading state
    render(<OwnedGamesGallery />)
    expect(screen.getByText('Dive Back Into the Action')).toBeInTheDocument()
    expect(screen.getByText('Loading your games...')).toBeInTheDocument()
  })

  test('renders error state when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))
    render(<OwnedGamesGallery />)

  })

  test('renders games when API call succeeds', async () => {
    axios.get.mockResolvedValue({ data: mockGames })
    render(<OwnedGamesGallery />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your games...')).not.toBeInTheDocument()

      // Check game titles and playtime
      expect(screen.getByText('Test Game 1')).toBeInTheDocument()
      expect(screen.getByText('Test Game 2')).toBeInTheDocument()
      expect(screen.getByText('Test Game 3')).toBeInTheDocument()

      expect(screen.getByText('20.00 Hours Played')).toBeInTheDocument() // 1200 minutes
      expect(screen.getByText('10.00 Hours Played')).toBeInTheDocument() // 600 minutes
      expect(screen.getByText('5.00 Hours Played')).toBeInTheDocument() // 300 minutes

      // Check images
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(6)
      expect(images[0]).toHaveAttribute('src', '/redirect.png')
      expect(images[1]).toHaveAttribute('src', '/redirect.png')

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
    render(<OwnedGamesGallery />)
  })

  test('makes correct API call with credentials', async () => {
    axios.get.mockResolvedValue({ data: mockGames })
    render(<OwnedGamesGallery />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/ownedGames', {
        withCredentials: true,
      })
    })
  })

  test('limits display to 8 games when more are returned', async () => {
    const manyGames = Array(15)
      .fill()
      .map((_, i) => ({
        id: `${i}`,
        title: `Game ${i}`,
        playtime_forever: 600,
      }))
    axios.get.mockResolvedValue({ data: manyGames })
    render(<OwnedGamesGallery />)

    
  })

  test('sorts games by playtime in descending order', async () => {
    const unsortedGames = [
      { id: '1', title: 'Low Play', playtime_2weeks: 300 },
      { id: '2', title: 'High Play', playtime_2weeks: 1200 },
      { id: '3', title: 'Medium Play', playtime_2weeks: 600 },
    ]
    axios.get.mockResolvedValue({ data: unsortedGames })
    render(<OwnedGamesGallery />)

    await waitFor(() => {
      const gameElements = screen.getAllByRole('link')
      // Should be sorted: High Play (1200) -> Medium Play (600) -> Low Play (300)
      expect(gameElements[0]).toHaveAttribute('href', '/SingleGame/2') // High Play
      expect(gameElements[1]).toHaveAttribute('href', '/SingleGame/3') // Medium Play
      expect(gameElements[2]).toHaveAttribute('href', '/SingleGame/1') // Low Play
    })
  })
})
