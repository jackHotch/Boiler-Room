import { render, screen } from '@testing-library/react'
import TopRatedGames from './TopRatedGames'
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
  redirectImage: 'redirectImage',
  gameCardInfo: 'gameCardInfo',
  sectionHeader: 'sectionHeader',
  subHeader: 'subHeader',
}))

describe('TopRatedGames', () => {
  test('does not render games with hide = 1', () => {
    const hiddenGames = [
      {
        game_id: '1',
        name: 'Hidden Game',
        header_image: 'hidden.jpg',
        boil_score: 80,
        total_played: 100,
        hide: 1,
      },
    ]
    render(<TopRatedGames games={hiddenGames} />)

    const images = screen.queryAllByRole('img')
    expect(images).toHaveLength(0) // Hidden game should not be rendered
  })

  test('shows fallback message when no games are provided', () => {
    render(<TopRatedGames games={[]} />)
    expect(screen.getByText('No owned games to display')).toBeInTheDocument()
  })
})
