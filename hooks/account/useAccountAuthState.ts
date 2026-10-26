'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

export function useAccountAuthState() {
  const {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    users,
    impersonateUser,
    loginWithGoogle
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (!res.success) {
        setAuthError(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('An error occurred during login.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const res = await registerUser(registerName, registerEmail, registerPhone, registerAddress, registerPassword);
      if (!res.success) {
        setAuthError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setAuthError('An error occurred during registration.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success && !res.cancelled) {
        setAuthError(res.error || 'Google sign-in failed.');
      }
    } catch (err) {
      setAuthError('An error occurred during Google sign-in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    users,
    impersonateUser,
    loginWithGoogle,
    authMode, setAuthMode,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerName, setRegisterName,
    registerEmail, setRegisterEmail,
    registerPhone, setRegisterPhone,
    registerAddress, setRegisterAddress,
    registerPassword, setRegisterPassword,
    authError, setAuthError,
    showLoginPassword, setShowLoginPassword,
    showRegisterPassword, setShowRegisterPassword,
    rememberMe, setRememberMe,
    isSubmittingAuth,
    isGoogleLoading,
    showForgotPasswordModal, setShowForgotPasswordModal,
    forgotPasswordEmail, setForgotPasswordEmail,
    forgotPasswordSent, setForgotPasswordSent,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleGoogleSignIn,
  };
}
