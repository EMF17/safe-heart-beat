import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import workerUrl from "qr-scanner/qr-scanner-worker.min.js?url";

QrScanner.WORKER_PATH = workerUrl;

interface Props {
  onScan: (text: string) => void;
  onError?: (message: string) => void;
}

/**
 * Live camera QR scanner. Client-only — must be rendered behind a user action
 * so the camera permission prompt has context.
 */
export function QrScannerView({ onScan, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    const scanner = new QrScanner(
      video,
      (result) => {
        if (!cancelled && result.data) onScan(result.data);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        maxScansPerSecond: 5,
      },
    );
    scanner
      .start()
      .then(() => {
        if (!cancelled) setStarting(false);
      })
      .catch(() => {
        if (!cancelled) {
          setStarting(false);
          onError?.(
            "Couldn't access the camera. Check permission, or type the code instead.",
          );
        }
      });
    return () => {
      cancelled = true;
      scanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
      <video ref={videoRef} className="w-full aspect-square object-cover" muted playsInline />
      {starting && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
          Starting camera…
        </div>
      )}
    </div>
  );
}
