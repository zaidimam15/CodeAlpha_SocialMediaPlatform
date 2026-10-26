import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Avatar } from '../src/components/common/Avatar.jsx';
import { Modal } from '../src/components/common/Modal.jsx';
import { ConfirmationModal } from '../src/components/common/ConfirmationModal.jsx';
import { PostCard } from '../src/components/posts/PostCard.jsx';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { ToastProvider } from '../src/context/ToastContext.jsx';

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Frontend UI Components', () => {
  it('renders Avatar with fallback initials', () => {
    render(<Avatar alt="Alex Rivers" />);
    expect(screen.getByText('AR')).toBeInTheDocument();
  });

  it('renders Modal when isOpen is true and closes on close button click', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal body content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close Modal');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Test Modal">
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders ConfirmationModal with title, message, and confirm button', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this?"
        confirmText="Confirm Delete"
      />
    );

    expect(screen.getByText('Delete Post')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm Delete' });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders PostCard with content, author, and action counts', () => {
    const dummyPost = {
      _id: 'post_123',
      content: 'Exploring #react and modern UI design',
      likesCount: 5,
      commentsCount: 2,
      bookmarksCount: 1,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date().toISOString(),
      author: {
        _id: 'user_1',
        displayName: 'Elena Rostova',
        username: 'elena_rostova',
        avatar: '',
        isVerified: true,
      },
    };

    renderWithProviders(<PostCard post={dummyPost} />);

    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('@elena_rostova')).toBeInTheDocument();
    expect(screen.getByText(/Exploring/)).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
