import { useState, useRef, useCallback } from "react";

export function useScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setIsSharing(true);

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setIsSharing(false);
        streamRef.current = null;
      });

      return stream;
    } catch {
      setIsSharing(false);
      return null;
    }
  }, []);

  const stopSharing = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsSharing(false);
  }, []);

  const captureSnapshot = useCallback(async (): Promise<string | null> => {
    const stream = streamRef.current;
    if (!stream) return null;

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    const w = settings.width || 1280;
    const h = settings.height || 720;

    // Create a temporary video element to grab frame
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    const canvas = document.createElement("canvas");
    // Downscale for speed
    const scale = Math.min(1, 800 / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.pause();
    video.srcObject = null;

    // JPEG at 60% quality for fast transfer
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    return dataUrl.split(",")[1]; // return base64 only
  }, []);

  return { isSharing, startSharing, stopSharing, captureSnapshot, streamRef, videoRef };
}
