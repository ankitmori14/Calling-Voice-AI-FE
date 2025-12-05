import { useVoiceChat } from '../hooks/useVoiceChat';
import './VoiceChat.css';

const VoiceChat = () => {
  const {
    isConnected,
    isConnecting,
    transcript,
    error,
    sessionId,
    startSession,
    stopSession,
    clearTranscript,
  } = useVoiceChat();

  return (
    <div className="voice-chat-container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <h1>🎓 Parul University</h1>
          <p className="subtitle">AI Admission Assistant</p>
        </div>
        <div className="status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Conversation Display */}
        <div className="conversation-panel">
          <div className="conversation-header">
            <h2>Conversation</h2>
            {sessionId && <span className="session-id">Session: {sessionId.slice(0, 8)}</span>}
          </div>

          <div className="transcript-container">
            {transcript.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>No conversation yet</p>
                <p className="hint">Click "Start Session" to begin talking with the AI assistant</p>
              </div>
            ) : (
              <div className="transcript">
                {transcript.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.speaker === 'You' ? 'user' : 'assistant'} ${
                      !message.isFinal ? 'partial' : ''
                    }`}
                  >
                    <div className="message-header">
                      <span className="speaker">{message.speaker}</span>
                      <span className="timestamp">{message.timestamp}</span>
                    </div>
                    <div className="message-text">{message.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {transcript.length > 0 && (
            <button onClick={clearTranscript} className="btn-clear" disabled={isConnecting}>
              Clear Transcript
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="controls-panel">
          <div className="controls-header">
            <h2>Controls</h2>
          </div>

          <div className="controls-content">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="control-buttons">
              {!isConnected ? (
                <button
                  onClick={startSession}
                  disabled={isConnecting}
                  className="btn-primary btn-start"
                >
                  {isConnecting ? (
                    <>
                      <span className="spinner"></span>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🎤</span>
                      Start Session
                    </>
                  )}
                </button>
              ) : (
                <button onClick={stopSession} className="btn-danger btn-stop">
                  <span className="btn-icon">⏹️</span>
                  Stop Session
                </button>
              )}
            </div>

            {isConnected && (
              <div className="listening-indicator">
                <div className="pulse"></div>
                <p>Listening... Speak now</p>
              </div>
            )}

            <div className="info-box">
              <h3>How it works:</h3>
              <ul>
                <li>Click "Start Session" to begin</li>
                <li>Speak naturally - the AI will listen and respond</li>
                <li>Ask about courses, fees, admissions, or scholarships</li>
                <li>Click "Stop Session" when you're done</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Powered by LiveKit, LangGraph & FastAPI</p>
      </div>
    </div>
  );
};

export default VoiceChat;
