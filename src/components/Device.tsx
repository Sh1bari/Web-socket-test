import React, { useEffect, useState } from "react";
import { Card, Badge, Button, Collapse, Table, Modal } from "react-bootstrap";
import { useWebSocket } from "./global/WebSocketProvider";
import QRCode from "../modals/QRCode";
import api from "../API/api";
import * as Enums from "../enums/DeviceConfigurationEnum";
import DropdownList from "./global/DropdownList";
import { Subscription } from "stompjs";
import { useDispatch } from "react-redux";
import { setOpenDeviceId } from "../redux/reducers/deviceReducer";

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
  const [curDevice, setCurDevice] = useState<Device>(device);
  const { stompClient } = useWebSocket();
  const [currentStatus, setCurrentStatus] = useState(
    device.deviceCurrentStatus
  );
  const [globalStatus, setGlobalStatus] = useState(device.deviceGlobalStatus);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const dispatch = useDispatch();

  const getStatusBadgeVariant = (status: string): string => {
    return status === "ONLINE" ? "success" : "danger";
  };

  const handleRecordingResolutionChange = (value: string) => {
    setCurDevice((prevDevice) => ({
      ...prevDevice,
      deviceConfiguration: {
        ...prevDevice.deviceConfiguration,
        recordingResolution: value as Enums.RecordingResolution,
      },
    }));
    updateDeviceConfiguration(
      "recording-resolution",
      "recordingResolution",
      value
    );
  };

  const handleRecordingSourceChange = (value: string) => {
    setCurDevice((prevDevice) => ({
      ...prevDevice,
      deviceConfiguration: {
        ...prevDevice.deviceConfiguration,
        recordingSource: value as Enums.RecordingSource,
      },
    }));
    updateDeviceConfiguration("recording-source", "recordingSource", value);
  };

  const handleRecordingModeChange = (value: string) => {
    setCurDevice((prevDevice) => ({
      ...prevDevice,
      deviceConfiguration: {
        ...prevDevice.deviceConfiguration,
        recordingMode: value as Enums.RecordingMode,
      },
    }));
    updateDeviceConfiguration("recording-mode", "recordingMode", value);
  };

  const handleUploadModeChange = (value: string) => {
    setCurDevice((prevDevice) => ({
      ...prevDevice,
      deviceConfiguration: {
        ...prevDevice.deviceConfiguration,
        uploadMode: value as Enums.UploadMode,
      },
    }));
    updateDeviceConfiguration("upload-mode", "uploadMode", value);
  };

  const updateDeviceConfiguration = async (
    configuration: string,
    configurationName: string,
    configurationValue: string
  ) => {
    try {
      const response = await api.patch(
        `/device/configuration/${configuration}?deviceId=${curDevice.id}&${configurationName}=${configurationValue}`
      );
      setNewDevice(response.data);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const renderGlobalStatusIcon = (): React.ReactNode => {
    switch (globalStatus) {
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
    const statusUpdate = JSON.parse(message.body);

    setCurDevice((prevDevice) => ({
      ...prevDevice,
      deviceConfiguration: {
        recordingResolution: statusUpdate.recordingResolution,
        recordingSource: statusUpdate.recordingSource,
        recordingMode: statusUpdate.recordingMode,
        uploadMode: statusUpdate.uploadMode,
      },
    }));
    // Логика обработки сообщения...
  };

  const handleCurrentStatusSubscription = (message: any) => {
    const statusUpdate = JSON.parse(message.body);

    // Обновляем состояние текущего статуса
    setCurrentStatus(statusUpdate.status);
  };

  let configSubscription: Subscription | null = null;
  let statusSubscription: Subscription | null = null;

  useEffect(() => {
    const connectAndSubscribe = () => {
      if (stompClient) {
        const deviceId = device.id.toString();

        const tryConnect = () => {
          try {
            configSubscription = stompClient.subscribe(
              `/topic/configuration/${deviceId}`,
              handleConfigurationSubscription
            );
            statusSubscription = stompClient.subscribe(
              `/topic/currentStatus/${deviceId}`,
              handleCurrentStatusSubscription
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
      configSubscription?.unsubscribe();
      statusSubscription?.unsubscribe();
    };
  }, [stompClient]);

  const startSendingSegments = async (deviceId: number) => {
    try {
      await api.post(
        `/admin/device/${deviceId}/command/start-sending-segments-data`
      );
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        // Обработка ошибки 409 (Conflict)
        window.alert(error.response.data.message);
      } else {
        // Обработка других ошибок
        console.error(
          "Error fetching filtered devices:",
          getErrorMessage(error)
        );
      }
    }
  };

  const getRegistrationTokenById = async () => {
    try {
      const response = await api.get(
        `/admin/device/register-token?deviceId=${device.id}`
      );
      setNewDevice(response.data);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const banDeviceById = async () => {
    try {
      const response = await api.post(`/admin/device/${device.id}/ban`);
      setGlobalStatus(response.data.deviceGlobalStatus);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const recoverDeviceById = async () => {
    try {
      const response = await api.post(`/admin/device/${device.id}/recover`);
      setGlobalStatus(response.data.deviceGlobalStatus);
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
    setIsQRModalOpen(true);
  };

  const handleBanDevice = () => {
    banDeviceById();
  };

  const handleRecoverDevice = () => {
    recoverDeviceById();
  };

  const handleClose = () => {
    setIsQRModalOpen(false);
  };

  return (
    <Card style={{ marginBottom: "10px", borderRadius: "10px" }}>
      <Card.Body>
        <Card.Title>
          Device ID: {curDevice.id}{" "}
          <Badge bg={getStatusBadgeVariant(currentStatus)}>
            {currentStatus}
          </Badge>
        </Card.Title>
        <Button
          variant="link"
          onClick={() => {
            setIsOpen(!isOpen);
            {
              isOpen
                ? dispatch(setOpenDeviceId(0))
                : dispatch(setOpenDeviceId(curDevice.id));
            }
            {
              isOpen ? null : startSendingSegments(curDevice.id);
            }
          }}
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
                    {globalStatus === "WAITING_FOR_ACTIVATION" && (
                      <div style={{ marginLeft: "30%" }}>
                        <Button variant="primary" onClick={handleDetailsClick}>
                          QR code
                        </Button>
                      </div>
                    )}
                    {globalStatus === "ACTIVE" && (
                      <div style={{ marginLeft: "30%" }}>
                        <Button variant="danger" onClick={handleBanDevice}>
                          Ban
                        </Button>
                      </div>
                    )}
                    {globalStatus === "BANNED" && (
                      <div style={{ marginLeft: "30%" }}>
                        <Button variant="success" onClick={handleRecoverDevice}>
                          Recover
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    <strong>Recording Source:</strong>{" "}
                  </td>
                  <td style={{ width: "50%" }}>
                    <div className="input-group" style={{ width: "100%" }}>
                      <DropdownList
                        selectedValue={
                          curDevice.deviceConfiguration.recordingResolution
                        }
                        options={Object.values(Enums.RecordingResolution)}
                        onSelect={(value) =>
                          handleRecordingResolutionChange(value)
                        }
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    <strong>Recording Source:</strong>{" "}
                  </td>
                  <td style={{ width: "50%" }}>
                    <div className="input-group" style={{ width: "100%" }}>
                      <DropdownList
                        selectedValue={
                          curDevice.deviceConfiguration.recordingSource
                        }
                        options={Object.values(Enums.RecordingSource)}
                        onSelect={(value) => handleRecordingSourceChange(value)}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    <strong>Recording Mode:</strong>{" "}
                  </td>
                  <td style={{ width: "50%" }}>
                    <div className="input-group" style={{ width: "100%" }}>
                      <DropdownList
                        selectedValue={
                          curDevice.deviceConfiguration.recordingMode
                        }
                        options={Object.values(Enums.RecordingMode)}
                        onSelect={(value) => handleRecordingModeChange(value)}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ width: "50%" }}>
                    <strong>Upload Mode:</strong>{" "}
                  </td>
                  <td style={{ width: "50%" }}>
                    <div className="input-group" style={{ width: "100%" }}>
                      <DropdownList
                        selectedValue={curDevice.deviceConfiguration.uploadMode}
                        options={Object.values(Enums.UploadMode)}
                        onSelect={(value) => handleUploadModeChange(value)}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Collapse>
      </Card.Body>

      <Modal show={isQRModalOpen} onHide={handleClose}>
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
