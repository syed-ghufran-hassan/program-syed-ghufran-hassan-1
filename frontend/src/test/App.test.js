import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublishNoteForm from '../pages/PublishNoteForm'; // Updated path

// Mock the fetch function
global.fetch = jest.fn();

global.alert = jest.fn();

describe('PublishNoteForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  test('renders the publish note form with all elements', () => {
    render(<PublishNoteForm />);
    
    expect(screen.getByText('Publish a Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your note content here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish Note' })).toBeInTheDocument();
  });

  test('shows error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<PublishNoteForm />);
    
    const submitButton = screen.getByRole('button', { name: 'Publish Note' });
    await user.click(submitButton);
    
    expect(screen.getByText('Note content is required!')).toBeInTheDocument();
  });

  test('successfully submits form with valid content', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<PublishNoteForm />);
    
    const textarea = screen.getByPlaceholderText('Enter your note content here');
    const submitButton = screen.getByRole('button', { name: 'Publish Note' });
    
    await user.type(textarea, 'This is my test note!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/publishNote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'This is my test note!' }),
      });
    });
  });

  test('handles API error response', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<PublishNoteForm />);
    
    const textarea = screen.getByPlaceholderText('Enter your note content here');
    const submitButton = screen.getByRole('button', { name: 'Publish Note' });
    
    await user.type(textarea, 'Test note content');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});