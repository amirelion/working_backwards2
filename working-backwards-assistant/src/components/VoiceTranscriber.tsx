import React, { useState, useRef } from 'react';
import { Button, Box, CircularProgress, Typography, IconButton, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

interface VoiceTranscriberProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
  currentText?: string;
  label?: string;
  compact?: boolean;
}

const VoiceTranscriber: React.FC<VoiceTranscriberProps> = ({ 
  onTranscription, 
  placeholder = "No transcription yet...", 
  currentText = "",
  label = "Record your voice",
  compact = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(currentText);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access your microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks in the stream
        if (mediaRecorderRef.current) {
          const tracks = mediaRecorderRef.current.stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.mp3');
      formData.append('model', 'whisper-1');
      
      // Call your backend API that will forward the request to OpenAI
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const data = await response.json();
      setTranscription(data.text);
      onTranscription(data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again or use text input instead.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearTranscription = () => {
    setTranscription("");
    onTranscription("");
  };

  const useTranscription = () => {
    onTranscription(transcription);
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          color={isRecording ? "error" : "primary"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          size="small"
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
        
        {isTranscribing && <CircularProgress size={20} />}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <StopIcon /> : <MicIcon />}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          sx={{ mr: 2 }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        
        {isTranscribing && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2">Transcribing...</Typography>
          </Box>
        )}
      </Box>
      
      {isRecording && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recording in progress... Click Stop when finished.
        </Typography>
      )}
      
      {/* Removing the display of transcription text here, as it's already shown in the text field */}
    </Box>
  );
};

export default VoiceTranscriber; 