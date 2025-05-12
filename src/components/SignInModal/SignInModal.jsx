import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, useDbUpdate, database } from '../../utilities/firebase';
import { ref, get } from 'firebase/database';
import googleLogo from '../../images/googlelogo.svg';
import './SignInModal.css';

export default function SignInModal({ show, onHide }) {
    const navigate = useNavigate();
    const [update] = useDbUpdate('/users');
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            // console.log('result:', result);

            const userID = result.uid;

            const userRef = ref(database, `/users/${userID}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.newUser) {
                    // console.log('User data:', userData);
                    navigate('/profile');
                }
            } else {
                const userData = {
                    [userID]:
                    {
                        displayName: result.displayName,
                        email: result.email,
                        photoURL: result.photoURL,
                        about: '',
                        newUser: true,
                        policyData: [],
                        preferences: [],
                    }
                };
                await (update(userData));
            }

            onHide();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            dialogClassName="sign-in-modal-dialog"
            contentClassName="sign-in-modal-content"
        >
            <Modal.Header closeButton>
                <Modal.Title>Sign In</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex justify-content-center">
                <Button onClick={handleGoogleSignIn} className="w-100 google-btn">
                    <img
                        src={googleLogo}
                        alt="Google logo"
                        className="google-icon"
                    />
                    Sign in with Google
                </Button>
            </Modal.Body>
        </Modal>
    );
}
