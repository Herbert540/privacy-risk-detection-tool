import { useParams } from 'react-router-dom';
import { useAuthState, useDbData } from '../../utilities/firebase';
import { Container, Spinner, Alert, Card } from 'react-bootstrap';
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
    <div className="analysis-page">
      <Container className="analysis-container">
        <Card className="analysis-card shadow-sm">
          <Card.Body>
            <h1 className="analysis-title">{title}</h1>
            <p className="analysis-timestamp">
              {new Date(timestamp).toLocaleString()}
            </p>

            {/* Preferences Matches */}
            {matchingClauses?.length > 0 && (
              <section className="section-matching">
                <h2 className="section-heading">Preferences Matches</h2>
                {matchingClauses.map(
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
                        {clauses.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                      {educationalNotes && (
                        <div className="educational-notes">
                          <strong>Educational Notes:</strong> {educationalNotes}
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
            {conflictingClauses?.length > 0 && (
              <section className="section-conflicts mt-5">
                <h2 className="section-heading">Preference Conflicts</h2>
                {conflictingClauses.map(
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
                        {clauses.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                      {educationalNotes && (
                        <div className="educational-notes">
                          <strong>Educational Notes:</strong> {educationalNotes}
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
      </Container>
    </div>
  );
}
