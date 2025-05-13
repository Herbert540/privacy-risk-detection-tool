import { useState } from 'react';
import { Form, Button, Alert, Spinner, Container } from 'react-bootstrap';
import { extractPolicy } from '../../utilities/extractPolicy';
import './Upload.css';

function Upload() {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [policyText, setPolicyText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = e => {
        setFile(e.target.files[0]);
        setUrl('');
        setPolicyText('');
        setError('');
    };

    const handleUrlChange = e => {
        setUrl(e.target.value);
        setFile(null);
        setPolicyText('');
        setError('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setPolicyText('');
        if (!file && !url.trim()) {
            setError('Please upload a file or enter a URL.');
            return;
        }
        setLoading(true);
        try {
            const text = await extractPolicy({ file, url });
            setPolicyText(text);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="upload">
            <h1>Upload Privacy Policy</h1>

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
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner animation="border" size="sm" /> Extracting...
                        </>
                    ) : (
                        'Extract & Display'
                    )}
                </Button>
            </Form>

            {policyText && (
                <div className="policy-display mt-4">
                    <h2>Extracted Policy Text</h2>
                    <div className="policy-text">{policyText}</div>
                </div>
            )}
        </Container>
    );
}

export default Upload;
