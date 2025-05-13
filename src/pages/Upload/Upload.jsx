import { useState } from 'react';
import { Form, Button, Alert, Spinner, Container, Card, ListGroup, Row, Col } from 'react-bootstrap';
import { useAuthState, useDbData } from '../../utilities/firebase';
import { extractPolicy } from '../../utilities/extractPolicy';
import { analyzePolicy } from '../../utilities/analyzePolicy';
import './Upload.css';

function Upload() {
    const [user] = useAuthState();
    const [prefs] = useDbData(user ? `users/${user.uid}/preferences` : null);

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
            setError('Loading user preferences…');
            return;
        }

        setLoading(true);
        try {
            const policyText = await extractPolicy({ file, url });
            const analysis = await analyzePolicy(policyText, prefs);

            setOutput(analysis);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container className="upload">
            <h1>Upload & Analyze</h1>

            <Form onSubmit={handleSubmit} className="upload-form">
                <Form.Group controlId="policyFile">
                    <Form.Label>Upload File (TXT or PDF)</Form.Label>
                    <Form.Control
                        type="file"
                        accept=".txt,.pdf"
                        onChange={handleFileChange}
                    />
                </Form.Group>

                <div className="or-divider">— or —</div>

                <Form.Group controlId="policyUrl">
                    <Form.Label>Paste Policy URL</Form.Label>
                    <Form.Control
                        type="url"
                        placeholder="https://example.com/privacy"
                        value={url}
                        onChange={handleUrlChange}
                    />
                </Form.Group>

                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}

                <Button
                    variant="primary"
                    type="submit"
                    className="mt-3"
                    disabled={loading || !!output}
                >
                    {loading
                        ? <> <Spinner animation="border" size="sm" /> Analyzing… </>
                        : 'Analyze Policy'}
                </Button>
            </Form>

            {output && (
                <div className="analysis-display mt-4 text-start">
                    {output.matchingClauses?.length > 0 && (
                        <section className="section-matching">
                            <h2>Preferences Matches</h2>
                            {output.matchingClauses.map(({ preference, clauses }) => (
                                <div key={preference} className="preference-block">
                                    <h3 className="preference-heading">{preference}</h3>
                                    <ul className="clause-list">
                                        {clauses.map((clause, i) => (
                                            <li key={i}>{clause}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}

                    {output.conflictingClauses?.length > 0 && (
                        <section className="section-conflicts mt-4">
                            <h2>Preference Conflicts</h2>
                            {output.conflictingClauses.map(({ preference, clauses }) => (
                                <div key={preference} className="preference-block">
                                    <h3 className="preference-heading">{preference}</h3>
                                    <ul className="clause-list">
                                        {clauses.map((clause, i) => (
                                            <li key={i}>{clause}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            )}

        </Container>
    );
}

export default Upload;
