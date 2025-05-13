import { useParams } from 'react-router-dom';
import { useAuthState, useDbData } from '../../utilities/firebase';
import { Container, Spinner, Alert } from 'react-bootstrap';
import './AnalysisDetail.css';

export default function AnalysisDetail() {
    const { id } = useParams();
    const [user] = useAuthState();
    const [entry, error] = useDbData(
        user ? `users/${user.uid}/privacyData/${id}` : null
    );

    if (!user) return <Alert variant="info">Sign in to view history.</Alert>;
    if (error) return <Alert variant="danger">{error.message}</Alert>;
    if (!entry) return <Spinner animation="border" />;

    const { title, analysis, timestamp } = entry;
    const { matchingClauses, conflictingClauses } = analysis;

    return (
        <Container className="analysis-detail">
            <h1>{title}</h1>
            <p className="timestamp">{new Date(timestamp).toLocaleString()}</p>

            {matchingClauses?.length > 0 && (
                <section>
                    <h2>Preferences Matches</h2>
                    {matchingClauses.map(({ preference, clauses }) => (
                        <div key={preference}>
                            <h3>{preference}</h3>
                            <ul>
                                {clauses.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
            )}

            {conflictingClauses?.length > 0 && (
                <section className="mt-4">
                    <h2>Preference Conflicts</h2>
                    {conflictingClauses.map(({ preference, clauses }) => (
                        <div key={preference}>
                            <h3>{preference}</h3>
                            <ul>
                                {clauses.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    ))}
                </section>
            )}
        </Container>
    );
}
