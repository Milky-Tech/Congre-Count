import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface CameraViewProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
}

export function CameraView({ onVideoReady, isActive }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      if (!isActive || !videoRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && mounted) {
            videoRef.current.play();
            onVideoReady(videoRef.current);
            setIsLoading(false);
          }
        };
      } catch (err) {
        if (mounted) {
          console.error('Error accessing camera:', err);
          setError('Unable to access camera. Please ensure camera permissions are granted.');
          setIsLoading(false);
        }
      }
    }

    function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isActive, onVideoReady]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-red-500 text-white p-4 rounded-lg flex items-start space-x-3 max-w-md">
            <AlertCircle className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
