import React, { useState, useEffect } from 'react';
import ProfilePage from '../pages/ProfilePage';
import BasicProfilePage from '../pages/BasicProfilePage';

const ProfilePageWrapper: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // Used to force re-render

  // Reset error state if we navigate away and back
  useEffect(() => {
    return () => {
      setHasError(false);
    };
  }, []);

  // Error boundary for the ProfilePage component
  if (hasError) {
    console.log('Using BasicProfilePage as fallback due to error in ProfilePage');
    return <BasicProfilePage />;
  }

  return (
    <React.Fragment key={key}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <ProfilePage />
      </ErrorBoundary>
    </React.Fragment>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Profile page error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // The parent component will handle the fallback
    }

    return this.props.children;
  }
}

export default ProfilePageWrapper;