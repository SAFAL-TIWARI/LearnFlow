import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import OwnerProfilePage from '../pages/OwnerProfilePage';
import UserProfilePage from '../pages/UserProfilePage';
import BasicProfilePage from '../pages/BasicProfilePage';

const ProfilePageWrapperComponent: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // Used to force re-render
  const location = useLocation();
  const params = useParams();
  const userId = params.userId;
  
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

  // If userId is provided in the URL, show the user profile page
  if (userId) {
    return (
      <React.Fragment key={key}>
        <ErrorBoundary onError={() => setHasError(true)}>
          <UserProfilePage userId={userId} />
        </ErrorBoundary>
      </React.Fragment>
    );
  }

  // Otherwise show the owner's profile page
  return (
    <React.Fragment key={key}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <OwnerProfilePage />
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

export default ProfilePageWrapperComponent;