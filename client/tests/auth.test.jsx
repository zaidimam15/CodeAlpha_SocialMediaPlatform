import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../src/pages/LoginPage.jsx';
import { RegisterPage } from '../src/pages/RegisterPage.jsx';
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

describe('Frontend Auth Pages', () => {
  it('renders login form elements and demo buttons', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/alex_rivers/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText('@alex_rivers')).toBeInTheDocument();
    expect(screen.getByText('@sophia_chen')).toBeInTheDocument();
  });

  it('renders register form elements', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByText('Join Connectify')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Alex Rivers/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/alex@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Registration/i })).toBeInTheDocument();
  });
});
