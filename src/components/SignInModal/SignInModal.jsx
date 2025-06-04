import { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'react-bootstrap-icons';
import { signInWithGoogle, useDbUpdate, database } from '../../utilities/firebase';
import { ref, get } from 'firebase/database';
import googleLogo from '../../images/googlelogo.svg';
import './SignInModal.css';

export default function SignInModal({ show, onHide }) {
    const navigate = useNavigate();
    const [update] = useDbUpdate('/users');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            const result = await signInWithGoogle();
            const userID = result.uid;
            const userRef = ref(database, `/users/${userID}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.newUser) {
                    navigate('/preferences');
                }
            } else {
                const userData = {
                    [userID]: {
                        displayName: result.displayName,
                        email: result.email,
                        photoURL: result.photoURL,
                        about: '',
                        newUser: true,
                        policyData: [],
                        preferences: [],
                    }
                };
                await update(userData);
                navigate('/preferences');
            }

            onHide();
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="md"
            dialogClassName="simple-signin-modal"
        >
            <Modal.Header closeButton className="simple-signin-header">
                <div className="signin-brand">
                    <ShieldCheck className="signin-icon" />
                    <Modal.Title>Sign in to Privacy Tool</Modal.Title>
                </div>
            </Modal.Header>

            <Modal.Body className="simple-signin-body">
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <Button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="simple-google-btn"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <img
                                src={googleLogo}
                                alt="Google logo"
                                className="google-icon"
                            />
                            Continue with Google
                        </>
                    )}
                </Button>

                <p className="signin-note">
                    Sign in to save your analysis history and preferences
                </p>
            </Modal.Body>
        </Modal>
    );
}