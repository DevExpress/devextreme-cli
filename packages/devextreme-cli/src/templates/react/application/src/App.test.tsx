import './matchMediaMock';
import { render, screen } from '@testing-library/react';
import App from './App';
import { act } from 'react-dom/test-utils';

describe("App", () => {
  test('renders learn react link', async () => {
    await act( async () => { render(<App/>) });
    const linkElement = screen.getByText(/create react app/i);
    expect(linkElement).toBeInTheDocument();
  });
})