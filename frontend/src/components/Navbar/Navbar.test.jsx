import { render } from '@testing-library/react'
import { Navbar } from './Navbar'

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams({ q: 'test query' }),
  usePathname: () => '/search',
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Navbar', () => {
  it('Navbar should render successfully', () => {
    const { baseElement } = render(<Navbar />)

    expect(baseElement).toBeTruthy()
  })
})
