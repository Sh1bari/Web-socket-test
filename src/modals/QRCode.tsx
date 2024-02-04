import React, { useRef } from "react";
import QRCodeLib from "qrcode.react";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

interface QRCodeProps {
  data: string;
}

const QRCode: React.FC<QRCodeProps> = ({ data }) => {
  const qrCodeRef = useRef<HTMLDivElement | null>(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      domtoimage
        .toBlob(qrCodeRef.current)
        .then((blob: Blob | null) => {
          if (blob) {
            saveAs(blob, "qrcode.png");
          }
        })
        .catch((error: Error) => {
          console.error("Error generating QR code image:", error);
        });
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div ref={qrCodeRef} style={{ marginBottom: "10px" }}>
        <QRCodeLib value={data} size={256} />
      </div>
      <button className="btn btn-primary" onClick={downloadQRCode}>
        Download QR Code
      </button>
    </div>
  );
};

export default QRCode;
