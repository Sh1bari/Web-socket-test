import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Button, Modal } from "react-bootstrap";
import api from "../API/api";
import Device from "../components/Device";
import CustomPagination from "../components/global/CustomPagination";
import QRCode from "../modals/QRCode";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface DeviceInterface {
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

const Devices: React.FC = () => {
  const [globalStatus, setGlobalStatus] = useState<string | null>("");
  const [currentStatus, setCurrentStatus] = useState<string | null>("");
  const [devices, setDevices] = useState<DeviceInterface[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevice, setNewDevice] = useState<NewDevice>(initialNewDevice);

  const fetchData = async () => {
    try {
      const response = await api.get(
        `/admin/devices?globalStatus=${globalStatus}&currentStatus=${currentStatus}&page=${
          currentPage - 1
        }`
      );
      setDevices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchData();
  }, [globalStatus, currentStatus, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  const addDevice = async () => {
    try {
      const response = await api.post(`/admin/device/register`);
      fetchData();
      getRegistrationTokenById(response.data.deviceId);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const getRegistrationTokenById = async (id: number) => {
    try {
      const response = await api.get(
        `/admin/device/register-token?deviceId=${id}`
      );
      setNewDevice(response.data);
    } catch (error) {
      console.error("Error fetching filtered devices:", getErrorMessage(error));
    }
  };

  const handleAddButtonClick = () => {
    addDevice();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const openDeviceId = useSelector((state: RootState) => state.device.openDeviceId);
  return (
    <>
      <Container className="mt-5">
        <Row>
          {/* Секция фильтра и устройств слева */}
          <Col md={6}>
            <div className="bg-light p-4 border rounded mb-4">
              <Form>
                <Form.Group controlId="globalStatus">
                  <Form.Label>Global Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={globalStatus || ""}
                    onChange={(e) => setGlobalStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="BANNED">Banned</option>
                    <option value="WAITING_FOR_ACTIVATION">
                      Waiting for Activation
                    </option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="currentStatus">
                  <Form.Label>Current Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={currentStatus || ""}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            </div>
            <Button
              variant="success"
              className="mb-3"
              onClick={handleAddButtonClick}
            >
              + Добавить
            </Button>
            {devices.length > 0 ? (
              devices.map((device) => (
                <Device key={device.id} device={device} />
              ))
            ) : (
              <p>No devices found.</p>
            )}
            {totalPages > 1 && (
              <CustomPagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </Col>

          {/* Секция пустой карточки справа */}
          <Col md={6}>
            <div className="card">
              <div className="card-header">Пустая карточка</div>
              <div className="card-body">
                <p className="card-text">{openDeviceId}</p>
              </div>
            </div>
          </Col>
        </Row>

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
      </Container>
    </>
  );
};

export default Devices;
