import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Search from './page.jsx'

jest.mock('../../components/GameDisplays/GameTable/GameTable', () => () => (
  <div data-testid='game-table'></div>
))

describe('Search Component', () => {
  test('renders Search header', () => {
    const { baseElement } = render(<Search />)
    expect(baseElement).toBeTruthy()
  })

  test('renders GameTable component', () => {
    render(<Search />)
    expect(screen.getByTestId('game-table')).toBeInTheDocument()
  })
})
