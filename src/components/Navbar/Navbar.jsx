import { useState } from 'react';
import { Button, Navbar, Nav } from 'react-bootstrap';
import { useAuthState, signOut, } from '../../utilities/firebase.js';
import { LayoutSidebarInset, PencilSquare, PersonCircle, BoxArrowRight, GearFill } from 'react-bootstrap-icons';
import { NavLink, useNavigate } from 'react-router-dom';
import SignInModal from '../SignInModal/SignInModal';
import './Navbar.css';

function AppNavbar({ onHistoryClick }) {
  const [user] = useAuthState();
  const [showSignIn, setShowSignIn] = useState(false);
  const navigate = useNavigate();

  const handleNewSummary = () => navigate('/upload');
  const handlePreferences = () => navigate('/preferences');
  const openModal = () => setShowSignIn(true);
  const closeModal = () => setShowSignIn(false);
  const handleSignOut = async () => {
    try { await signOut(); }
    catch (err) { console.error('Sign-out failed', err); }
  };

  const firstName = user?.displayName?.split(' ')[0] ?? '';

  return (
    <>
      <Navbar className="custom-navbar">
        <div className="navbar-content">
          <Nav className="navbar-left">
            <LayoutSidebarInset
              onClick={onHistoryClick}
              className="icon-button icon-sidebar"
              title="History"
            />
            <PencilSquare
              onClick={handleNewSummary}
              className="icon-button icon-plus"
              title="New Analysis"
            />
          </Nav>

          <Navbar.Brand className="navbar-brand">
            <NavLink to="/" className="navbar-brand-link">
              Privacy Tool
            </NavLink>
          </Navbar.Brand>

          <Nav className="navbar-right">
            {user ? (
              <>
                <span className="username">
                  Welcome, {firstName}
                </span>
                <GearFill
                  onClick={handlePreferences}
                  className="icon-button"
                  title="Preferences"
                />
                {/* <PersonCircle
                  onClick={handleProfile}
                  className="icon-button"
                  title="Profile"
                /> */}
                <BoxArrowRight
                  onClick={handleSignOut}
                  className="icon-button-logout"
                  title="Sign Out"
                />
              </>
            ) : (
              <Button
                variant="link"
                onClick={openModal}
                className="signin-button"
              >
                <PersonCircle className="signin-icon" />
                Sign In
              </Button>
            )}
          </Nav>
        </div>
      </Navbar>

      <SignInModal show={showSignIn} onHide={closeModal} />
    </>
  );
}

export default AppNavbar;