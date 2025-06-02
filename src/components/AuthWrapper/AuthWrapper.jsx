import React, { useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { PersonCircle, ShieldCheck } from 'react-bootstrap-icons';
import { useAuthState } from '../../utilities/firebase';
import SignInModal from '../SignInModal/SignInModal';
import './AuthWrapper.css';


function AuthWrapper({ children }) {
  const [user, loading] = useAuthState();
  const [showSignIn, setShowSignIn] = useState(false);

  const openSignInModal = () => setShowSignIn(true);
  const closeSignInModal = () => setShowSignIn(false);

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="auth-loading-card">
            <Card.Body className="text-center p-5">
              <ShieldCheck className="auth-loading-icon mb-3" />
              <h3 className="mb-3">Privacy Tool</h3>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading your privacy dashboard...</p>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  if (user) {
    return children;
  }


  return (
    <>
      <div className="auth-gate-screen">
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="auth-gate-card">
            <Card.Body className="text-center p-5">
              <div className="auth-brand mb-4">
                <ShieldCheck className="auth-brand-icon mb-3" />
                <h2 className="auth-brand-text">Privacy Tool</h2>
                <p className="text-muted">Your personal privacy policy analyzer</p>
              </div>

              <div className="auth-value-prop mb-4">
                <h4 className="mb-3">Understand What You're Really Agreeing To</h4>
                <p className="lead">
                  Analyze privacy policies in plain English and discover what companies 
                  are really doing with your personal data.
                </p>
              </div>

              <div className="auth-benefits mb-4">
                <div className="auth-benefit-item">
                  <ShieldCheck className="auth-benefit-icon" />
                  <span>Save your analysis history</span>
                </div>
                <div className="auth-benefit-item">
                  <ShieldCheck className="auth-benefit-icon" />
                  <span>Set personalized preferences</span>
                </div>
                <div className="auth-benefit-item">
                  <ShieldCheck className="auth-benefit-icon" />
                  <span>Get tailored privacy insights</span>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                onClick={openSignInModal}
                className="auth-signin-btn"
              >
                <PersonCircle className="me-2" />
                Sign In to Get Started
              </Button>

              <p className="text-muted mt-3 small">
                Free to use • No data collection • Instant analysis
              </p>
            </Card.Body>
          </Card>
        </Container>
      </div>

      
      <SignInModal show={showSignIn} onHide={closeSignInModal} />
    </>
  );
}

export default AuthWrapper;