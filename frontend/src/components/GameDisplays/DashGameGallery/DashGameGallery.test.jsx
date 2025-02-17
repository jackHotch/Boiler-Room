import { render } from '@testing-library/react'
import { DashGameGallery } from './DashGameGallery'

describe('DashGameGallery', () => {
  it('DashGameGallery should render successfully', () => {
    const { baseElement } = render(<DashGameGallery />)

    expect(baseElement).toBeTruthy()
  })
})
