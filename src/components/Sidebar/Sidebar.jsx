import { Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { XSquare, Trash } from 'react-bootstrap-icons';
import { ref, remove } from 'firebase/database';
import { useAuthState, useDbData, database } from '../../utilities/firebase';
import './Sidebar.css';

export default function Sidebar({ show, toggle, selectedId, setSelectedId }) {
    const navigate = useNavigate();
    const [user] = useAuthState();

    const [data] = useDbData(
        user ? `users/${user.uid}/privacyData` : null
    );

    const items = data
        ? Object.entries(data)
            .map(([id, entry]) => ({ id, ...entry }))
            .sort((a, b) => b.timestamp - a.timestamp)
        : [];

    const handleClick = (id) => {
        if (selectedId === id) {
            setSelectedId(null);
        } else {
            setSelectedId(id);
            navigate(`/analysis/${id}`);
        }
    };

    const truncate = (text, max = 50) =>
        text.length > max ? text.slice(0, max) + '…' : text;

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!user) return;

        try {
            await remove(ref(database, `users/${user.uid}/privacyData/${id}`));
            if (selectedId === id) {
                setSelectedId(null);
                navigate('/');
            }
        } catch (err) {
            console.error('Error deleting entry:', err);
        }
    };

    return (
        <Offcanvas show={show} onHide={toggle} style={{ width: '300px' }}>
            <Offcanvas.Header>
                <Offcanvas.Title className="sidebar-title">
                    Saved Summaries
                </Offcanvas.Title>
                <XSquare
                    onClick={toggle}
                    className="close-icon-button"
                    title="Close"
                />
            </Offcanvas.Header>
            <Offcanvas.Body>
                {items.length > 0 ? (
                    <ul className="sidebar-list">
                        {items.map(({ id, title, timestamp }) => (
                            <OverlayTrigger
                                key={id}
                                placement="top"
                                overlay={<Tooltip id={`tt-${id}`}>{title}</Tooltip>}
                            >
                                <li
                                    className={
                                        'sidebar-item' +
                                        (selectedId === id ? ' selected' : '')
                                    }
                                    onClick={() => handleClick(id)}
                                >
                                    <div className="item-content">
                                        <span className="item-date">
                                            {new Date(timestamp).toLocaleDateString()}&nbsp;
                                            {new Date(timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span className="item-title">{truncate(title)}</span>
                                    </div>
                                    <Trash
                                        className="delete-icon"
                                        title="Delete"
                                        onClick={(e) => handleDelete(e, id)}
                                    />
                                </li>
                            </OverlayTrigger>
                        ))}
                    </ul>
                ) : (
                    <p className="no-items">No saved policies.</p>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}
