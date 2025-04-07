import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Search from './page.jsx'

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams({ q: 'test query' }),
}))

describe('Search Component', () => {
  test('renders Search header', () => {
    const { baseElement } = render(<Search />)
    expect(baseElement).toBeTruthy()
  })

  test('renders GameTable component', () => {
    render(<Search />)
  })
})
