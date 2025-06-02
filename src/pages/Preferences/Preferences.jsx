import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Badge } from 'react-bootstrap';
import { useAuthState, useDbUpdate, database } from '../../utilities/firebase';
import { ref, get } from 'firebase/database';
import { GearFill, PlusCircleFill, CheckCircleFill } from 'react-bootstrap-icons';
import './Preferences.css';

function Preferences() {
  const [user] = useAuthState();
  const [update] = useDbUpdate('/users');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // New state to track whether this is initial setup or editing existing preferences
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);

  // Preference state with comprehensive default structure
  const [preferences, setPreferences] = useState({
    format: {
      concise: false,
      simplified: false,
      highlighting: false,
    },
    content: {
      dataUsage: false,
      thirdParty: false,
      appFunctionality: false,
      privacyControls: false,
      dataRetention: false
    },
    toolBehavior: {
      riskTolerance: '',
      highlightMethod: '',
      severityLabeling: false,
      useDefaultRules: true,
      actionRecommendations: false,
      educationalPopups: false
    },
    summaryLength: '',
    additional: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = ref(database, `/users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Check if user has existing preferences to determine the experience type
          if (userData.preferences && Object.keys(userData.preferences).length > 0) {
            // User has existing preferences - this is an edit session
            setIsInitialSetup(false);
            setHasExistingPreferences(true);
            setPreferences(userData.preferences);
          } else {
            // User has no preferences - this is initial setup
            setIsInitialSetup(true);
            setHasExistingPreferences(false);
          }
        } else {
          // New user entirely - definitely initial setup
          setIsInitialSetup(true);
          setHasExistingPreferences(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your preferences');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // All the existing change handlers remain the same
  const handleFormatChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      format: {
        ...prev.format,
        [e.target.name]: e.target.checked
      }
    }));
  };

  const handleContentChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [e.target.name]: e.target.checked
      }
    }));
  };

  const handleSummaryLengthChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      summaryLength: e.target.value
    }));
  };

  const handleToolBehaviorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      toolBehavior: {
        ...prev.toolBehavior,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleAdditionalChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      additional: e.target.value
    }));
  };

  // Enhanced save function that updates the setup state
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be signed in to save preferences');
      return;
    }

    try {
      const userRef = ref(database, `/users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Update preferences while preserving other user data
        await update({
          [user.uid]: {
            ...userData,
            newUser: false,
            preferences: preferences
          }
        });

        // After successful save, switch to edit mode if it was initial setup
        if (isInitialSetup) {
          setIsInitialSetup(false);
          setHasExistingPreferences(true);
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save your preferences');
    }
  };

  // Loading state remains the same
  if (loading) {
    return (
      <Container className="preference-container">
        <div className="preference">
          <Card className="preference-card">
            <Card.Body>
              <Card.Title className="text-center mb-4">Loading your preferences...</Card.Title>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  // Create different header content based on user state
  const HeaderContent = () => {
    if (isInitialSetup) {
      return (
        <div className="preferences-header initial-setup">
          <div className="header-icon-section">
            <PlusCircleFill className="header-icon setup-icon" />
            <div className="header-text">
              <Card.Title className="setup-title">Set Up Your Privacy Preferences</Card.Title>
              <p className="setup-subtitle">
                Customize how Privacy Tool analyzes policies for you. You can change these anytime.
              </p>
            </div>
          </div>
          <div className="setup-welcome-note">
            <p className="welcome-text">
              <strong>Welcome!</strong> These preferences help us tailor privacy policy analysis to what matters most to you. 
              Don't worry about getting everything perfect - you can always adjust these settings later.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="preferences-header edit-mode">
          <div className="header-icon-section">
            <GearFill className="header-icon edit-icon" />
            <div className="header-text">
              <Card.Title className="edit-title">
                Edit Your Privacy Preferences
              </Card.Title>
              <p className="edit-subtitle">
                Update how Privacy Tool analyzes policies based on your preferences.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  // Create different button text and styling based on state
  const SaveButton = () => {
    if (isInitialSetup) {
      return (
        <Button variant="primary" type="submit" size="lg" className="setup-save-btn">
          <CheckCircleFill className="me-2" />
          Complete Setup
        </Button>
      );
    } else {
      return (
        <Button variant="primary" type="submit" size="lg" className="edit-save-btn">
          <GearFill className="me-2" />
          Update Preferences
        </Button>
      );
    }
  };

  return (
    <Container className="preference-container">
      <div className="preference">
        <Card className="preference-card">
          <Card.Body>
            <HeaderContent />

            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                {isInitialSetup 
                  ? "Your preferences have been set up successfully!" 
                  : "Your preferences have been updated successfully!"
                }
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* All your existing form sections remain exactly the same */}
              <Card className="mb-4">
                <Card.Header>What do you want in privacy policies?</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="concise"
                      name="concise"
                      label="Shorter, more concise policies"
                      checked={preferences.format.concise}
                      onChange={handleFormatChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="simplified"
                      name="simplified"
                      label="Simplified language"
                      checked={preferences.format.simplified}
                      onChange={handleFormatChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="highlighting"
                      name="highlighting"
                      label="Highlighting of important information"
                      checked={preferences.format.highlighting}
                      onChange={handleFormatChange}
                      className="mb-2"
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>Which details would you like clearly stated?</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="dataUsage"
                      name="dataUsage"
                      label="Clear explanations of data usage / data access"
                      checked={preferences.content.dataUsage}
                      onChange={handleContentChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="thirdParty"
                      name="thirdParty"
                      label="How/which third-party will get/use data"
                      checked={preferences.content.thirdParty}
                      onChange={handleContentChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="appFunctionality"
                      name="appFunctionality"
                      label="What enhanced app functionality this allows"
                      checked={preferences.content.appFunctionality}
                      onChange={handleContentChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="privacyControls"
                      name="privacyControls"
                      label="Available privacy controls and opt-outs"
                      checked={preferences.content.privacyControls}
                      onChange={handleContentChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id="dataRetention"
                      name="dataRetention"
                      label="Data retention and deletion policies"
                      checked={preferences.content.dataRetention}
                      onChange={handleContentChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>How should the tool behave?</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Risk Tolerance</Form.Label>
                    <Form.Select
                      name="riskTolerance"
                      value={preferences.toolBehavior.riskTolerance}
                      onChange={handleToolBehaviorChange}
                      className="mb-3"
                    >
                      <option value="">Select one</option>
                      <option value="strict">Flag everything (strict)</option>
                      <option value="majorOnly">Only flag major risks</option>
                      <option value="industry">Follow industry standards (GDPR, CCPA)</option>
                    </Form.Select>

                    <Form.Label>Highlight Method</Form.Label>
                    <Form.Select
                      name="highlightMethod"
                      value={preferences.toolBehavior.highlightMethod}
                      onChange={handleToolBehaviorChange}
                      className="mb-3"
                    >
                      <option value="">Select one</option>
                      <option value="list">List flagged clauses</option>
                      <option value="summary">Summarize in plain language</option>
                      <option value="legalRefs">Include legal references</option>
                    </Form.Select>

                    <Form.Check
                      type="checkbox"
                      name="severityLabeling"
                      label="Categorize by severity (High/Medium/Low)"
                      checked={preferences.toolBehavior.severityLabeling}
                      onChange={handleToolBehaviorChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      name="useDefaultRules"
                      label="Use default privacy best practices"
                      checked={preferences.toolBehavior.useDefaultRules}
                      onChange={handleToolBehaviorChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      name="actionRecommendations"
                      label="Show Accept / Reject / Investigate suggestions"
                      checked={preferences.toolBehavior.actionRecommendations}
                      onChange={handleToolBehaviorChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      name="educationalPopups"
                      label="Include educational notes for flagged terms"
                      checked={preferences.toolBehavior.educationalPopups}
                      onChange={handleToolBehaviorChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>How long do you want summaries to be?</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Check
                      type="radio"
                      id="long"
                      name="summaryLength"
                      value="up-to-5"
                      label="Up to 5 minutes"
                      checked={preferences.summaryLength === 'up-to-5'}
                      onChange={handleSummaryLengthChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      id="medium"
                      name="summaryLength"
                      value="1-2"
                      label="1-2 minutes"
                      checked={preferences.summaryLength === '1-2'}
                      onChange={handleSummaryLengthChange}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      id="short"
                      name="summaryLength"
                      value="minimum"
                      label="As little as possible"
                      checked={preferences.summaryLength === 'minimum'}
                      onChange={handleSummaryLengthChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>Additional Preferences</Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Label>Is there anything else in particular you would like?</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={preferences.additional}
                      onChange={handleAdditionalChange}
                      placeholder="Add any other preferences you'd like us to consider..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="d-grid">
                <SaveButton />
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Preferences;