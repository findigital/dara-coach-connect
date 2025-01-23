import { useState, useRef } from 'react';
import { getEphemeralToken } from '@/services/openAiService';

export const useWebRTCConnection = (voice: string, onMessage: (msg: any) => void) => {
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const startConnection = async () => {
    try {
      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken(voice);

      setStatus("Establishing connection...");
      const pc = new RTCPeerConnection();
      const dataChannel = pc.createDataChannel('response');
      
      dataChannel.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        onMessage(msg);
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(stream.getTracks()[0]);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      console.log('Making request to OpenAI with URL:', `${baseUrl}?model=${model}&voice=${voice}`);
      
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });

      peerConnectionRef.current = pc;
      dataChannelRef.current = dataChannel;
      setIsSessionActive(true);
      setStatus("Session established successfully!");
      
      return { pc, dataChannel, stream };
    } catch (error) {
      console.error('Error establishing connection:', error);
      throw error;
    }
  };

  const stopConnection = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsSessionActive(false);
    setStatus("");
  };

  return {
    status,
    isSessionActive,
    startConnection,
    stopConnection,
    dataChannel: dataChannelRef.current,
  };
};