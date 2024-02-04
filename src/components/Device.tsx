import React, { useEffect, useState } from "react";
import { Card, Badge, Button, Collapse, Table, Modal } from "react-bootstrap";
import { useWebSocket } from "./global/WebSocketProvider";
import QRCode from "../modals/QRCode";
import api from "../API/api";

interface DeviceProps {
  device: Device;
}

interface Device {
  id: number;
  deviceGlobalStatus: string;
  deviceCurrentStatus: string;
  deviceConfiguration: {
    recordingResolution: string;
    recordingSource: string;
    recordingMode: string;
    uploadMode: string;
  };
}

interface NewDevice {
    deviceId: number;
    userId: number;
    token: string;
  }
  
  const initialNewDevice: NewDevice = {
    deviceId: 0, // значение по умолчанию для deviceId
    userId: 0, // значение по умолчанию для userId
    token: "", // значение по умолчанию для token
  };

const Device: React.FC<DeviceProps> = ({ device }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDevice, setNewDevice] = useState<NewDevice>(initialNewDevice);
  const { stompClient } = useWebSocket();
  const [subscription, setSubscription] = useState<{
    unsubscribe: () => void;
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState(
    device.deviceCurrentStatus
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadgeVariant = (status: string): string => {
    return status === "ONLINE" ? "success" : "danger";
  };

  const renderGlobalStatusIcon = (): React.ReactNode => {
    switch (device.deviceGlobalStatus) {
      case "ACTIVE":
        return <Badge bg="success">Active ✔</Badge>;
      case "BANNED":
        return <Badge bg="danger">Banned 🚫</Badge>;
      case "WAITING_FOR_ACTIVATION":
        return <Badge bg="warning">Waiting ⌛</Badge>;
      default:
        return null;
    }
  };

  const handleConfigurationSubscription = (message: any) => {
    console.log("Configuration message received:", message);
    // Логика обработки сообщения...
  };

  const handleCurrentStatusSubscription = (message: any) => {
    const statusUpdate = JSON.parse(message.body);

    // Обновляем состояние текущего статуса
    setCurrentStatus(statusUpdate.status);
  };

  useEffect(() => {
    const connectAndSubscribe = () => {
      if (stompClient) {
        const deviceId = device.id.toString();

        const tryConnect = () => {
          try {
            const configSubscription = stompClient.subscribe(
              `/topic/configuration/${deviceId}`,
              handleConfigurationSubscription
            );
            const statusSubscription = stompClient.subscribe(
              `/topic/currentStatus/${deviceId}`,
              handleCurrentStatusSubscription
            );

            // Используйте функциональный аргумент для обновления стейта
            setSubscription((prevSubscription) => ({
              unsubscribe: () => {
                if (prevSubscription) {
                  prevSubscription.unsubscribe();
                }
                configSubscription.unsubscribe();
                statusSubscription.unsubscribe();
              },
            }));
          } catch (error) {
            // Логируем ошибку в консоль
            //console.error("Error while connecting:", error);
            // Повторяем попытку через 100 миллисекунд
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
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [stompClient]);

  const getRegistrationTokenById = async () => {
    try {
      const response = await api.get(`/admin/device/register-token?deviceId=${device.id}`);
      setNewDevice(response.data);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
      return error;
    } else if (error instanceof Error) {
      return error.message;
    } else {
      return "Unknown error";
    }
  };

  const handleDetailsClick = () => {
    getRegistrationTokenById();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Card style={{ marginBottom: "10px", borderRadius: "10px" }}>
      <Card.Body>
        <Card.Title>
          Device ID: {device.id}{" "}
          <Badge bg={getStatusBadgeVariant(currentStatus)}>
            {currentStatus}
          </Badge>
        </Card.Title>
        <Button
          variant="link"
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: "absolute", top: "15px", right: "15px" }}
        >
          {isOpen ? "Hide Details" : "Show Details"}
        </Button>
        <Collapse in={isOpen}>
          <div>
            <Table striped bordered hover>
              <tbody>
                <tr>
                  <td>
                    <strong>Global Status:</strong>{" "}
                  </td>
                  <td style={{ display: "flex", alignItems: "center" }}>
                    {renderGlobalStatusIcon()}
                    {device.deviceGlobalStatus === "WAITING_FOR_ACTIVATION" && (
                      <div style={{ marginLeft: "30%" }}>
                        <Button variant="primary" onClick={handleDetailsClick}>
                          QR code
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Recording Resolution:</strong>
                  </td>
                  <td>{device.deviceConfiguration.recordingResolution}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Recording Source:</strong>
                  </td>
                  <td>{device.deviceConfiguration.recordingSource}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Recording Mode:</strong>
                  </td>
                  <td>{device.deviceConfiguration.recordingMode}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Upload Mode:</strong>
                  </td>
                  <td>{device.deviceConfiguration.uploadMode}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Collapse>
      </Card.Body>

      <Modal show={isModalOpen} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Device Id: {newDevice.deviceId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QRCode data={newDevice.token} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

    </Card>
  );
};

export default Device;
