import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useWebSocket } from "./global/WebSocketProvider";
import { Subscription } from "stompjs";
import Segment from "./Segment";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";

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
  const isOnline = useSelector((state: RootState) => state.device.isOnline);
  const [segments, setSegments] = useState<SegmentWebSocketData[]>([]);
  const [activeTab, setActiveTab] = useState("segments");

  let segmentSubscription: Subscription | null = null;

  const handleSegmentSubscription = (message: any) => {
    try {
      const segmentsDto: SegmentsWebSocketDto = JSON.parse(message.body);
      setSegments(segmentsDto.segments);
    } catch (error) {
      console.error("Error handling segment subscription:", error);
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

  const renderContent = () => {
    switch (activeTab) {
      case "online":
        return <div>Онлайн контент</div>; // Ваш контент для вкладки "Онлайн"
      case "segments":
        return isOnline ? (
          <div className="d-flex flex-column mt-3">
            {segments.map((segment, index) => (
              <div key={index} className="mb-3 ml-3">
                <Segment segment={segment} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-3 ml-3 mt-3">
            Устройство оффлайн. Нет данных по сегментам.
          </div>
        );
      case "etc":
        return <div>Прочий контент</div>; // Ваш контент для вкладки "Прочее"
      default:
        return <div>Контент по умолчанию</div>;
    }
  };

  return (
    <>
      <div className="container">
        {deviceId !== 0 ? (
          <div className="card">
            <div className="card-header">Device ID: {deviceId}</div>
            <TabContainer
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab as string)}
            >
              <Nav variant="tabs" className="nav-fill">
                <Nav.Item>
                  <Nav.Link eventKey="online">Онлайн</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="segments">Сегменты</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="etc">Прочее</Nav.Link>
                </Nav.Item>
              </Nav>
              <TabContent>
                <TabPane eventKey="online">{renderContent()}</TabPane>
                <TabPane eventKey="segments">{renderContent()}</TabPane>
                <TabPane eventKey="etc">{renderContent()}</TabPane>
              </TabContent>
            </TabContainer>
          </div>
        ) : (
          <div className="card-header">Устройство не выбрано</div>
        )}
      </div>
    </>
  );
};

export default Segments;
