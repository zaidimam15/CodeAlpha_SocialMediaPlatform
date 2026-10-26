import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { CreatePostCard } from './CreatePostCard.jsx';

export function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const handleCreated = (newPost) => {
    if (onPostCreated) {
      onPostCreated(newPost);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Post" maxWidth="max-w-xl">
      <CreatePostCard onPostCreated={handleCreated} />
    </Modal>
  );
}
