import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Friends from './page.jsx'

describe('Friends Page', () => {
  it('Friends should render successfully', () => {
    const { baseElement } = render(<Friends />)

    expect(baseElement).toBeTruthy()
  })
})
