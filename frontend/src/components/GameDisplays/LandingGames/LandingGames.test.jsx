import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LandingGames from './LandingGames'
import '@testing-library/jest-dom'


// Mock CSS module
jest.mock('./LandingGames.module.css', () => new Proxy({}, {
  get: (target, prop) => prop
}))

const mockGames = [
  {
    game_id: '123',
    name: 'Cool Game',
    description: 'A super cool game.',
    header_image: 'http://example.com/image.jpg',
    boil_score: 85,
    metacritic_score: 90,
    hltb_score: 10.5,
  }
]

describe('LandingGames', () => {
  test('renders section title', () => {
    render(<LandingGames games={mockGames} />)
    expect(screen.getByText('Featured Games')).toBeInTheDocument()
  })

  test('renders game details', () => {
    render(<LandingGames games={mockGames} />)

    expect(screen.getByText('Cool Game')).toBeInTheDocument()
    expect(screen.getByText('A super cool game.')).toBeInTheDocument()
    expect(screen.getByText(/BOIL Rating: 85/)).toBeInTheDocument()
    expect(screen.getByText(/Metacritic: 90/)).toBeInTheDocument()
    expect(screen.getByText(/Time to Beat: 10.5 hrs/)).toBeInTheDocument()
  })

  test('shows tooltip text on hover', async () => {
    render(<LandingGames games={mockGames} categories={[]} />)

    const questionMark = screen.getByText('?')
    fireEvent.mouseOver(questionMark)

    const tooltip = await screen.findByText('Rating that prioritizes highly rated, shorter games.')
    expect(tooltip).toBeInTheDocument()
  })
})
