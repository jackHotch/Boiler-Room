import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import GameTable from './GameTable'

// Mock image loading to avoid network requests
jest.spyOn(global, 'Image').mockImplementation(() => {
  const img = {}
  img.onload = null
  img.onerror = null
  Object.defineProperty(img, 'src', {
    set() {
      // Simulate successful image load
      if (img.onload) {
        setTimeout(() => img.onload(), 0)
      }
    },
  })
  return img
})

const mockGames = [
  {
    game_id: '12345',
    name: 'Game One',
    metacritic_score: 85,
    hltb_score: 10,
    boil_score: 50,
    header_image: 'https://example.com/game1.jpg',
  },
  {
    game_id: '67890',
    name: 'Game Two',
    metacritic_score: 78,
    hltb_score: 15,
    boil_score: 60,
    header_image: 'https://example.com/game2.jpg',
  },
]

describe('GameTable Component', () => {
  // Clean up after each test to prevent lingering effects
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders table with correct headers', async () => {
    render(<GameTable games={mockGames} />)

    // Use waitFor to ensure the DOM is fully updated
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Metacritic Rating')).toBeInTheDocument()
      expect(screen.getByText('Average Length')).toBeInTheDocument()
      expect(screen.getByText('BOIL')).toBeInTheDocument()
      expect(screen.getByText('Steam Page')).toBeInTheDocument()
    })
  })

  test('renders game rows correctly', async () => {
    render(<GameTable games={mockGames} />)

    // Use waitFor to ensure all elements are rendered
    await waitFor(() => {
      expect(screen.getByText('Game One')).toBeInTheDocument()
      expect(screen.getByText('Game Two')).toBeInTheDocument()
      expect(screen.getByText('85')).toBeInTheDocument()
      expect(screen.getByText('78')).toBeInTheDocument()
      expect(screen.getByText('10 Hrs')).toBeInTheDocument()
      expect(screen.getByText('15 Hrs')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('60')).toBeInTheDocument()

      const gameLinks = screen.getAllByRole('link', { name: /Game (One|Two)/ })
      expect(gameLinks).toHaveLength(mockGames.length)
      expect(gameLinks[0]).toHaveAttribute('href', '/SingleGame/12345')
      expect(gameLinks[1]).toHaveAttribute('href', '/SingleGame/67890')

      const steamLinks = screen.getAllByRole('link', { name: 'Steam Page' })
      expect(steamLinks).toHaveLength(mockGames.length)
      expect(steamLinks[0]).toHaveAttribute(
        'href',
        'https://store.steampowered.com/app/12345'
      )
      expect(steamLinks[1]).toHaveAttribute(
        'href',
        'https://store.steampowered.com/app/67890'
      )
    })
  })
})
