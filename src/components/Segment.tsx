import React, { useState } from "react";
import { Card } from "react-bootstrap";
import SegmentModal from "../modals/SegmentModal";

interface SegmentProps {
  segment: SegmentWebSocketData;
}

interface SegmentWebSocketData {
  segmentName: string;
  durationMillis: number;
  status: string;
  startRecording: string;
  recordingSource: string;
  recordingResolution: string;
  recordingMode: string;
}

const Segment: React.FC<SegmentProps> = ({ segment }) => {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Card style={{ width: "24rem" }} className="mb-2">
        <div
          onClick={handleShowModal}
          style={{
            cursor: "pointer",
            paddingLeft: "10px", // Отступ слева
          }}
        >
          <Card.Title
            style={{
              fontSize: "1.2rem", // Размер шрифта
              paddingTop: "10px"
            }}
          >
            {segment.segmentName}
          </Card.Title>
        </div>

        <SegmentModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          segment={segment}
        />
      </Card>
    </>
  );
};

export default Segment;
