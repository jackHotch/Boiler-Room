import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Friends from './page.jsx'

describe('Friends Page', () => {
  it('Friends should render successfully', () => {
    const { baseElement } = render(<Friends />)
    const heading = screen.getByText('Your Friends')

    expect(baseElement).toBeTruthy()
    expect(heading).toHaveTextContent('Your Friends')
  })
})
