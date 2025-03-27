import { render, screen, waitFor } from '@testing-library/react'
import DashGameGallery from './DashGameGallery'
import '@testing-library/jest-dom'

// Mock the CSS module
jest.mock('./DashGameGallery.module.css', () => ({
  gallery: 'gallery',
  gameContainer: 'gameContainer',
  enlarged: 'enlarged',
  imageWrapper: 'imageWrapper',
  imageContainer: 'imageContainer',
  gameImage: 'gameImage',
  placeholder: 'placeholder',
  gameCategory: 'gameCategory',
  placeholderText: 'placeholderText',
}))

// Mock the Image constructor to control image loading
const mockImage = {
  src: '',
  onload: null,
  onerror: null,
  complete: false,
}

global.Image = jest.fn(() => {
  const image = { ...mockImage }
  // Set complete to true after a small delay to simulate real image loading
  setTimeout(() => {
    image.complete = true
    if (image.onload) image.onload()
  }, 0)
  return image
})

describe('DashGameGallery', () => {
  const mockGames = [
    { game_id: '123', name: 'Test Game 1' },
    { game_id: '456', name: 'Test Game 2' },
    { game_id: '789', name: 'Test Game 3' },
  ]

  const mockCategories = [
    { label: 'Category 1' },
    { label: 'Category 2' },
    { label: 'Category 3' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockImage.complete = false
    mockImage.onload = null
    mockImage.onerror = null
  })

  test('renders loading state initially', () => {
    render(<DashGameGallery games={mockGames} categories={mockCategories} />)
    expect(screen.getByText('Loading gallery...')).toBeInTheDocument()
  })

  test('renders games after images are loaded', async () => {
    render(<DashGameGallery games={mockGames} categories={mockCategories} />)

    // Wait for loading state to disappear (accounting for the 500ms delay)
    await waitFor(
      () => {
        expect(screen.queryByText('Loading gallery...')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    // Check if game names are rendered
    expect(screen.getByText('Test Game 1')).toBeInTheDocument()
    expect(screen.getByText('Test Game 2')).toBeInTheDocument()
    expect(screen.getByText('Test Game 3')).toBeInTheDocument()

    // Check if categories are rendered
    expect(screen.getByText('Category 1')).toBeInTheDocument()
    expect(screen.getByText('Category 2')).toBeInTheDocument()
    expect(screen.getByText('Category 3')).toBeInTheDocument()

    // Check if images are rendered with correct src
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
  })

  test('handles middle game enlargement when there are 3 games', async () => {
    render(<DashGameGallery games={mockGames} categories={mockCategories} />)

    await waitFor(
      () => {
        expect(screen.queryByText('Loading gallery...')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    const gameContainers = screen.getAllByText(/Test Game/).map((el) => el.parentElement)
    expect(gameContainers[1]).toHaveClass('enlarged')
    expect(gameContainers[0]).not.toHaveClass('enlarged')
    expect(gameContainers[2]).not.toHaveClass('enlarged')
  })

  test('renders correct links to single game pages', async () => {
    render(<DashGameGallery games={mockGames} categories={mockCategories} />)

    await waitFor(
      () => {
        expect(screen.queryByText('Loading gallery...')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', '/SingleGame/123')
    expect(links[1]).toHaveAttribute('href', '/SingleGame/456')
    expect(links[2]).toHaveAttribute('href', '/SingleGame/789')
  })
})
