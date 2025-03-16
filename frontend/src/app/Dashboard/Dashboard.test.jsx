import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from './page.jsx'

jest.mock('../../components/GameDisplays/DashGameGallery/DashGameGallery', () => () => (
  <div data-testid='dash-game-gallery'></div>
))
jest.mock('../../components/GameDisplays/GameTable/GameTable', () => () => (
  <div data-testid='game-table'></div>
))

describe('Dashboard Component', () => {
  test('renders Dashboard header', () => {
    const { baseElement } = render(<Dashboard />)
    expect(baseElement).toBeTruthy()
  })

  test('renders DashGameGallery and GameTable components', () => {
    render(<Dashboard />)

    expect(screen.getByTestId('dash-game-gallery')).toBeInTheDocument()
    expect(screen.getByTestId('game-table')).toBeInTheDocument()
  })
})
