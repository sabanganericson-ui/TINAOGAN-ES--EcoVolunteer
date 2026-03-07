declare module "react-qr-scanner" {
  import { CSSProperties } from "react";

  interface QrScannerProps {
    delay?: number | false;
    onScan: (result: { text: string } | null) => void;
    onError: (error: Error | null) => void;
    constraints?: MediaStreamConstraints;
    style?: CSSProperties;
    className?: string;
    facingMode?: "user" | "environment";
    legacyMode?: boolean;
    maxImageSize?: number;
    chooseDeviceId?: () => string;
  }

  const QrScanner: React.FC<QrScannerProps>;
  export default QrScanner;
}
