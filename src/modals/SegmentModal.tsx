import React from "react";
import { Modal, Button } from "react-bootstrap";

interface SegmentModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
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

const SegmentModal: React.FC<SegmentModalProps> = ({
  showModal,
  handleCloseModal,
  segment,
}) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Segment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Segment Name:</strong> {segment.segmentName}
        </p>
        <p>
          <strong>Duration:</strong> {segment.durationMillis} milliseconds
        </p>
        <p>
          <strong>Status:</strong> {segment.status}
        </p>
        <p>
          <strong>Start Recording:</strong> {segment.startRecording}
        </p>
        <p>
          <strong>Recording Source:</strong> {segment.recordingSource}
        </p>
        <p>
          <strong>Recording Resolution:</strong> {segment.recordingResolution}
        </p>
        <p>
          <strong>Recording Mode:</strong> {segment.recordingMode}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SegmentModal;
