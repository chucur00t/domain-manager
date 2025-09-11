import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from './page'
import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('Page', () => {
  it('renders a heading', () => {
    render(<Page />)

    const heading = screen.getByRole('heading', { level: 1, name: /Domain Manager/i })

    expect(heading).toBeInTheDocument()
  })
})
