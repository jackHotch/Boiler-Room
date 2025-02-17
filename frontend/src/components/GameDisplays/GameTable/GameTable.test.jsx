import { render } from '@testing-library/react'
import { GameTable } from './GameTable'

describe('GameTable', () => {
  it('GameTable should render successfully', () => {
    const { baseElement } = render(<GameTable />)

    expect(baseElement).toBeTruthy()
  })
})
