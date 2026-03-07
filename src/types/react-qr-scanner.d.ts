declare module "react-qr-scanner" {
  import { Component } from "react";

  interface QrReaderProps {
    onScan: (data: { text: string } | null) => void;
    onError: (error: Error) => void;
    onLoad?: () => void;
    constraints?: MediaStreamConstraints;
    resolution?: number;
    qrArea?: number[];
    style?: React.CSSProperties;
    className?: string;
  }

  export default class QrReader extends Component<QrReaderProps> {}
}
