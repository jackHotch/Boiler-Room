import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import GameTable from './GameTable'

const mockGames = [
  {
    game_id: '12345',
    name: 'Game One',
    metacritic_score: 85,
    hltb_score: 10,
    boil_score: 50,
  },
  {
    game_id: '67890',
    name: 'Game Two',
    metacritic_score: 78,
    hltb_score: 15,
    boil_score: 60,
  },
]

describe('GameTable Component', () => {
  test('renders table with correct headers', () => {
    render(<GameTable games={mockGames} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Aggregate Rating')).toBeInTheDocument()
    expect(screen.getByText('Average Length')).toBeInTheDocument()
    expect(screen.getByText('BOIL')).toBeInTheDocument()
    expect(screen.getByText('Steam Page')).toBeInTheDocument()
    expect(screen.getByText(/Played/)).toBeInTheDocument() // Using regex to match the "Played" column header
  })

  test('renders game rows correctly', () => {
    render(<GameTable games={mockGames} />)

    expect(screen.getByText('Game One')).toBeInTheDocument()
    expect(screen.getByText('Game Two')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('10 Hrs')).toBeInTheDocument()
    expect(screen.getByText('15 Hrs')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()

    // Check for game links
    const gameLinks = screen.getAllByRole('link', { name: /Game/ })
    expect(gameLinks).toHaveLength(mockGames.length)
    expect(gameLinks[0]).toHaveAttribute('href', '/SingleGame/12345')
    expect(gameLinks[1]).toHaveAttribute('href', '/SingleGame/67890')

    // Check for Steam links by finding links containing 'steampowered'
    const steamLinks = screen.getAllByRole('link', { name: '' })
    steamLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', expect.stringContaining('steampowered'))
    })

    // Check for checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(mockGames.length)
  })
})
