import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useWebSocket } from "./global/WebSocketProvider";
import { Subscription } from "stompjs";

interface SegmentWebSocketData {
  segmentName: string;
  durationMillis: number;
  status: string;
  startRecording: string;
  recordingSource: string;
  recordingResolution: string;
  recordingMode: string;
}

interface SegmentsWebSocketDto {
  segments: SegmentWebSocketData[];
}

const Segments: React.FC = () => {
  const { stompClient } = useWebSocket();
  const deviceId = useSelector((state: RootState) => state.device.openDeviceId);

  let segmentSubscription: Subscription | null = null;

  const handleSegmentSubscription = (message: any) => {
    try {
      const segmentsDto: SegmentsWebSocketDto = JSON.parse(message.body);

      segmentsDto.segments.forEach((segment) => {
        console.log(segment);
      });
    } catch (error) {
      console.error('Error handling segment subscription:', error);
    }
  };

  useEffect(() => {
    const connectAndSubscribe = () => {
      if (stompClient) {
        const tryConnect = () => {
          try {
            segmentSubscription = stompClient.subscribe(
              `/topic/segments/${deviceId}`,
              handleSegmentSubscription
            );
          } catch (error) {
            setTimeout(tryConnect, 100);
          }
        };

        // Вызываем функцию для первичной попытки подключения
        tryConnect();
      }
    };

    // Вызываем функцию для первичной попытки подключения
    connectAndSubscribe();

    // Возвращаем функцию отписки
    return () => {
      segmentSubscription?.unsubscribe();
    };
  }, [stompClient, deviceId]);

  return (
    <>
      <div className="card">
        {deviceId != 0 ? (
          <div className="card-header">Device ID: {deviceId}</div>
        ) : (
          <div className="card-header">Device not selected</div>
        )}
        <div className="card-body">
          <p className="card-text">{deviceId}</p>
        </div>
      </div>
    </>
  );
};

export default Segments;
