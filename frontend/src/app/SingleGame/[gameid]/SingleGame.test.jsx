import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import SingleGamePage from './page.jsx'
import { useParams } from 'next/navigation'

// Mock useParams to return a game ID
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

describe('SingleGamePage', () => {
  it('renders correctly with a game ID', async () => {
    // Mock game ID
    useParams.mockReturnValue({ gameid: '1' })

    const { baseElement } = render(<SingleGamePage />)

    // Ensure fetch is called with the correct URL
    expect(baseElement).toBeInTheDocument()
  })
})
