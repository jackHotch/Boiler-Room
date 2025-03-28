import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CookieMessage } from './CookieMessage'

jest.useFakeTimers()

test('component disappears after 10 seconds', () => {
  render(<CookieMessage />)

  // Check that the component is initially present
  expect(screen.getByTestId('cookie-message')).toBeInTheDocument()

  // Fast-forward 10 seconds
  act(() => {
    jest.advanceTimersByTime(10000)
  })

  // Check that the component is no longer in the DOM
  expect(screen.queryByTestId('cookie-message')).not.toBeInTheDocument()
})
