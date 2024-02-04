import React from 'react';
import QRCodeLib from 'qrcode.react';

interface QRCodeProps {
  data: string;
}

const QRCode: React.FC<QRCodeProps> = ({ data }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <QRCodeLib value={data} size={256} />
    </div>
  );
};

export default QRCode;
