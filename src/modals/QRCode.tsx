import React from 'react';

interface QRCodeProps {
  data: string;
}

const QRCode: React.FC<QRCodeProps> = ({ data }) => {
  return (
    <div>
        {data}
    </div>
  );
};

export default QRCode;
