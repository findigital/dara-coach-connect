export interface WebRTCStatus {
  status: string;
  setStatus: (status: string) => void;
  isSessionActive: boolean;
  currentVolume: number;
}

export interface WebRTCConnection {
  status: string;
  setStatus: (status: string) => void;
  isSessionActive: boolean;
  startConnection: () => Promise<void>;
  stopConnection: () => void;
  currentVolume: number;
}