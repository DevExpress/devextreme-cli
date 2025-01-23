import './matchMediaMock';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import App from './App';
import { act } from 'react-dom/test-utils';

describe("App", () => {
  test('renders learn react link', async () => {
    await act( async () => { render(<App/>) });
    const linkElement = screen.getByText(/create react app/i);
    expect(linkElement).toBeInTheDocument();
  });
})