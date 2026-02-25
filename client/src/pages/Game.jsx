import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { FaPlay, FaPaperPlane, FaEye, FaUser, FaCrown, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import socket from '../socket/socket';
import Timer from '../components/Timer';
import WinnerModal from '../components/WinnerModal';

const Game = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [opponentBinary, setOpponentBinary] = useState('');
    const [opponentName, setOpponentName] = useState('Opponent');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [hasRun, setHasRun] = useState(false);
    const [showExpected, setShowExpected] = useState(false);
    const [gameOver, setGameOver] = useState(null);
    const [submitResult, setSubmitResult] = useState('');

    const editorRef = useRef(null);

    // Fetch room data
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await API.get(`/room/${roomId}`);
                setRoom(res.data);
                setTimeRemaining(res.data.timeLimit * 60);
                const isHost = res.data.host === user.id;
                setOpponentName(isHost ? res.data.opponentUsername : res.data.hostUsername);
            } catch (err) {
                navigate('/');
            }
        };
        fetchRoom();
    }, [roomId, user, navigate]);

    // Socket events
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        socket.on('timer-update', ({ timeRemaining: t }) => {
            setTimeRemaining(t);
        });

        socket.on('opponent-code-update', ({ binaryCode }) => {
            setOpponentBinary(binaryCode);
        });

        socket.on('code-output', ({ output: out }) => {
            setOutput(out);
            setHasRun(true);
        });

        socket.on('submit-result', ({ correct, message }) => {
            setSubmitResult(message);
            setTimeout(() => setSubmitResult(''), 3000);
        });

        socket.on('game-over', (data) => {
            setGameOver(data);
        });

        return () => {
            socket.off('timer-update');
            socket.off('opponent-code-update');
            socket.off('code-output');
            socket.off('submit-result');
            socket.off('game-over');
        };
    }, []);

    // Security: disable copy-paste and right-click
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                // Allow within the code editor only for ctrl+c/v/x
                if (!e.target.closest('.game-editor')) {
                    e.preventDefault();
                }
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleCodeChange = (value) => {
        setCode(value || '');
        socket.emit('code-update', { roomId, username: user.username, code: value || '' });
    };

    const handleRun = () => {
        socket.emit('run-code', { roomId, username: user.username, code });
    };

    const handleSubmit = () => {
        socket.emit('submit-code', { roomId, username: user.username, code });
    };

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
    };

    if (!room) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
                <p>Loading game...</p>
            </div>
        );
    }

    return (
        <div className="game-page" onContextMenu={(e) => e.preventDefault()}>
            {/* Game Header */}
            <div className="game-header">
                <div className="game-header-left">
                    <span className="game-player-badge player-blue-badge">
                        <FaCrown /> {user.username}
                    </span>
                </div>
                <div className="game-header-center">
                    <Timer timeRemaining={timeRemaining} />
                </div>
                <div className="game-header-right">
                    <span className="game-player-badge player-red-badge">
                        <FaUser /> {opponentName}
                    </span>
                </div>
            </div>

            {/* Challenge Banner */}
            <div className="challenge-banner">
                <span className="challenge-label">⚔️ CHALLENGE:</span>
                <span className="challenge-text">{room.challenge}</span>
            </div>

            {/* Game Panels */}
            <div className="game-panels">
                {/* Panel 1: Player Code Editor */}
                <div className="game-panel panel-editor game-editor">
                    <div className="panel-header panel-blue">
                        <FaCrown /> Your Code
                    </div>
                    <div className="editor-wrapper">
                        <Editor
                            height="100%"
                            defaultLanguage="html"
                            value={code}
                            onChange={handleCodeChange}
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                padding: { top: 10 },
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                bracketPairColorization: { enabled: true },
                                automaticLayout: true
                            }}
                        />
                    </div>
                </div>

                {/* Panel 2: Opponent Code (Binary) */}
                <div className="game-panel panel-opponent">
                    <div className="panel-header panel-red">
                        <FaLock /> Opponent Code (Encrypted)
                    </div>
                    <div className="opponent-code-view">
                        <div className="binary-text">
                            {opponentBinary || '01001000 01000101 01001100 01001100 01001111\n00101110 00101110 00101110\n⏳ Waiting for opponent to type...'}
                        </div>
                        <div className="opponent-overlay">
                            <FaLock className="lock-icon" />
                            <span>ENCRYPTED VIEW</span>
                        </div>
                    </div>
                </div>

                {/* Panel 3: Output */}
                <div className="game-panel panel-output">
                    <div className="panel-header panel-green">
                        <FaPlay /> Output
                    </div>
                    <div className="output-view">
                        {output ? (
                            <div className="output-content" dangerouslySetInnerHTML={{ __html: output }} />
                        ) : (
                            <div className="output-placeholder">
                                Click "Run" to see your output here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Game Controls */}
            <div className="game-controls">
                <button onClick={handleRun} className="btn-game btn-run">
                    <FaPlay /> Run
                </button>

                <button
                    onClick={handleSubmit}
                    className="btn-game btn-submit"
                    disabled={!hasRun}
                >
                    <FaPaperPlane /> Submit
                </button>

                <button
                    onClick={() => setShowExpected(!showExpected)}
                    className="btn-game btn-expected"
                >
                    <FaEye /> {showExpected ? 'Hide' : 'Show'} Expected
                </button>

                {submitResult && (
                    <div className="submit-feedback">{submitResult}</div>
                )}
            </div>

            {/* Expected Output Modal */}
            {showExpected && (
                <div className="expected-modal">
                    <div className="expected-content">
                        <h3>Expected Output (Visual)</h3>
                        <div className="expected-preview" dangerouslySetInnerHTML={{ __html: room.expectedOutput }} />
                        <p className="expected-note">Your code output must match this result</p>
                        <button onClick={() => setShowExpected(false)} className="btn-primary">Close</button>
                    </div>
                </div>
            )}

            {/* Winner Modal */}
            {gameOver && (
                <WinnerModal
                    data={gameOver}
                    currentUser={user.username}
                />
            )}
        </div>
    );
};

export default Game;
