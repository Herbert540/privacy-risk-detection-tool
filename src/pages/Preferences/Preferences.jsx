import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuthState, useDbUpdate, database } from '../../utilities/firebase';
import { ref, get } from 'firebase/database';
import './Preferences.css';

function Preferences() {
  const [user] = useAuthState();
  const [update] = useDbUpdate('/users');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Preference state
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

          if (userData.preferences) {
            setPreferences(userData.preferences);
          }
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

  // Save preferences to Firebase
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

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save your preferences');
    }
  };

  if (!user) {
    return (
      <Container className="preference-container">
        <div className="preference">
          <Card className="preference-card">
            <Card.Body>
              <Card.Title className="text-center mb-4">Your Privacy Policy Preferences</Card.Title>
              <p className="text-center">Please sign in to set your privacy policy preferences.</p>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="preference-container">
        <div className="preference">
          <Card className="preference-card">
            <Card.Body>
              <Card.Title className="text-center mb-4">Loading...</Card.Title>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container className="preference-container">
      <div className="preference">
        <Card className="preference-card">
          <Card.Body>
            <Card.Title className="text-center mb-4">Your Privacy Policy Preferences</Card.Title>

            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                Your preferences have been saved successfully!
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
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
                <Button variant="primary" type="submit" size="lg">
                  Save Preferences
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Preferences;