import { useState } from 'react';
import { Form, Button, Alert, Spinner, Container, Card } from 'react-bootstrap';
import { useAuthState, useDbData, useDbAdd } from '../../utilities/firebase';
import { extractPolicy } from '../../utilities/extractPolicy';
import { analyzePolicy } from '../../utilities/analyzePolicy';
import './Upload.css';

function Upload() {
    const [user] = useAuthState();
    const [prefs] = useDbData(user ? `users/${user.uid}/preferences` : null);
    const [addPrivacyData] = useDbAdd(`users/${user?.uid}/privacyData`);

    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = e => {
        setFile(e.target.files[0]);
        setUrl('');
        setOutput('');
        setError('');
    };

    const handleUrlChange = e => {
        setUrl(e.target.value);
        setFile(null);
        setOutput('');
        setError('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setOutput('');
        if (!file && !url.trim()) {
            setError('Please upload a file or enter a URL.');
            return;
        }
        if (!prefs) {
            setError('Error loading user preferences…');
            return;
        }

        setLoading(true);
        try {
            const policyText = await extractPolicy({ file, url });
            const analysis = await analyzePolicy(policyText, prefs);

            const baseTitle = file
                ? file.name.replace(/\.[^.]+$/, '')
                : (() => {
                    try { return new URL(url).hostname; }
                    catch { return url; }
                })();

            const timestamp = Date.now();
            // e.g. "WhatsApp Privacy Policy — May 13, 2025 3:42 PM"
            const dateLabel = new Date(timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            const title = `${baseTitle} — ${dateLabel}`;

            await addPrivacyData(
                {
                    title,
                    analysis,
                    timestamp,
                    filenameOrURL: file ? file.name : url
                },
                timestamp.toString()
            );

            setOutput(analysis);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="upload-page">
            <Container className="upload-container">
                <Card className="upload-card shadow-lg">
                    <Card.Body>
                        <h1 className="upload-title">Upload & Analyze Privacy Policy</h1>
                        <p className="upload-subtitle">
                            Upload a TXT/PDF or paste a URL, and we’ll highlight sections
                            that match or conflict with your preferences.
                        </p>

                        <Form onSubmit={handleSubmit} className="upload-form">
                            {/* Upload Field */}
                            <Form.Group controlId="policyFile" className="mb-4">
                                <Form.Label className="form-label">
                                    Upload File (TXT, PDF or DOCX)
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".txt,.pdf,.docx"
                                    onChange={handleFileChange}
                                    className="form-control-custom"
                                />
                            </Form.Group>

                            <div className="or-divider">— or —</div>

                            {/* URL Field */}
                            <Form.Group controlId="policyUrl" className="mt-4">
                                <Form.Label className="form-label">
                                    Paste Policy URL
                                </Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/privacy"
                                    value={url}
                                    onChange={handleUrlChange}
                                    className="form-control-custom"
                                />
                            </Form.Group>

                            {error && (
                                <Alert variant="danger" className="mt-3">
                                    {error}
                                </Alert>
                            )}

                            <div className="d-grid mt-4">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    size="lg"
                                    disabled={loading || !!output}
                                    className="btn-primary-custom"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" /> Analyzing…
                                        </>
                                    ) : (
                                        'Analyze Policy'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                {output && (
                    <Card className="result-card shadow-sm mt-5">
                        <Card.Body>
                            {/* Preferences Matches */}
                            {output.matchingClauses?.length > 0 && (
                                <section className="section-matching">
                                    <h2 className="section-heading">Preferences Matches</h2>
                                    {output.matchingClauses.map(
                                        ({
                                            preference,
                                            clauses,
                                            severity,
                                            educationalNotes,
                                            actionRecommendations
                                        }) => (
                                            <div
                                                key={preference}
                                                className="preference-block result-block"
                                            >
                                                <div className="pref-header">
                                                    <h3 className="preference-heading">{preference}</h3>
                                                    {severity && (
                                                        <div
                                                            className="severity-label"
                                                            data-severity={severity}
                                                        >
                                                            {severity}
                                                        </div>
                                                    )}
                                                </div>
                                                <ul className="clause-list">
                                                    {clauses.map((clause, i) => (
                                                        <li key={i}>{clause}</li>
                                                    ))}
                                                </ul>
                                                {educationalNotes && (
                                                    <div className="educational-notes">
                                                        <strong>Educational Notes:</strong>{' '}
                                                        {educationalNotes}
                                                    </div>
                                                )}
                                                {actionRecommendations && (
                                                    <div className="action-recommendations">
                                                        <strong>Action Recommendations:</strong>{' '}
                                                        {actionRecommendations}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </section>
                            )}

                            {/* Preference Conflicts */}
                            {output.conflictingClauses?.length > 0 && (
                                <section className="section-conflicts mt-5">
                                    <h2 className="section-heading">Preference Conflicts</h2>
                                    {output.conflictingClauses.map(
                                        ({
                                            preference,
                                            clauses,
                                            severity,
                                            educationalNotes,
                                            actionRecommendations
                                        }) => (
                                            <div
                                                key={preference}
                                                className="preference-block result-block"
                                            >
                                                <div className="pref-header">
                                                    <h3 className="preference-heading">{preference}</h3>
                                                    {severity && (
                                                        <div
                                                            className="severity-label"
                                                            data-severity={severity}
                                                        >
                                                            {severity}
                                                        </div>
                                                    )}
                                                </div>
                                                <ul className="clause-list">
                                                    {clauses.map((clause, i) => (
                                                        <li key={i}>{clause}</li>
                                                    ))}
                                                </ul>
                                                {educationalNotes && (
                                                    <div className="educational-notes">
                                                        <strong>Educational Notes:</strong>{' '}
                                                        {educationalNotes}
                                                    </div>
                                                )}
                                                {actionRecommendations && (
                                                    <div className="action-recommendations">
                                                        <strong>Action Recommendations:</strong>{' '}
                                                        {actionRecommendations}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </section>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </div>
    );
}

export default Upload;