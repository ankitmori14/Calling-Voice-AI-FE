import { useState, useEffect, useRef } from 'react';
import { Room } from 'livekit-client';
import { generateToken, createSession, endSession } from '../services/api';

/**
 * Custom hook to manage voice chat with LiveKit
 * Handles all connection logic behind the scenes
 */
export const useVoiceChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const roomRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = document.createElement('audio');
    audioElementRef.current.autoplay = true;
    document.body.appendChild(audioElementRef.current);

    return () => {
      if (audioElementRef.current) {
        document.body.removeChild(audioElementRef.current);
      }
    };
  }, []);

  /**
   * Start voice session
   * - Generates token automatically
   * - Creates session
   * - Connects to LiveKit room
   */
  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setTranscript([]);

      // Step 1: Generate token (behind the scenes)
      console.log('Generating access token...');
      const tokenData = await generateToken();

      // Step 2: Create backend session
      console.log('Creating session...');
      const session = await createSession();
      setSessionId(session.session_id);

      // Step 3: Connect to LiveKit room
      console.log('Connecting to LiveKit...');
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      // Set up event listeners
      setupRoomListeners(room, session.session_id);

      // Connect to room
      await room.connect(tokenData.url, tokenData.token);

      console.log('Connected successfully!');

      // Enable microphone and publish audio
      console.log('Enabling microphone...');
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log('Microphone enabled!');

      setIsConnected(true);

      // Add welcome message to transcript
      addToTranscript('System', 'Connected! You can start speaking now.');

    } catch (err) {
      console.error('Error starting session:', err);
      setError(err.message || 'Failed to start session');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Stop voice session
   */
  const stopSession = async () => {
    try {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      if (sessionId) {
        await endSession(sessionId);
      }

      setIsConnected(false);
      setSessionId(null);
      addToTranscript('System', 'Session ended.');

    } catch (err) {
      console.error('Error stopping session:', err);
      setError(err.message || 'Failed to stop session');
    }
  };

  /**
   * Set up room event listeners
   */
  const setupRoomListeners = (room, sessionId) => {
    // Track audio
    room.on('trackSubscribed', (track, publication, participant) => {
      if (track.kind === 'audio' && audioElementRef.current) {
        track.attach(audioElementRef.current);
      }
    });

    // Track unsubscribed
    room.on('trackUnsubscribed', (track) => {
      track.detach();
    });

    // Data received (for transcription/messages)
    room.on('dataReceived', (payload, participant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));

        if (data.type === 'transcription') {
          addToTranscript(
            participant?.identity || 'AI',
            data.text,
            data.is_final
          );
        }
      } catch (err) {
        console.error('Error parsing data:', err);
      }
    });

    // Participant connected
    room.on('participantConnected', (participant) => {
      console.log('Participant connected:', participant.identity);
    });

    // Disconnected
    room.on('disconnected', () => {
      console.log('Disconnected from room');
      setIsConnected(false);
    });
  };

  /**
   * Add message to transcript
   */
  const addToTranscript = (speaker, text, isFinal = true) => {
    const message = {
      id: Date.now(),
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString(),
      isFinal,
    };

    setTranscript((prev) => {
      // If it's a partial transcription, update the last message
      if (!isFinal && prev.length > 0 && prev[prev.length - 1].speaker === speaker) {
        const updated = [...prev];
        updated[updated.length - 1] = message;
        return updated;
      }
      return [...prev, message];
    });
  };

  /**
   * Clear transcript
   */
  const clearTranscript = () => {
    setTranscript([]);
  };

  return {
    isConnected,
    isConnecting,
    transcript,
    error,
    sessionId,
    startSession,
    stopSession,
    clearTranscript,
  };
};
