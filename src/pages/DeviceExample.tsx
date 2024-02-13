import { useEffect, useState } from "react";
import { useWebSocket } from "../components/global/WebSocketProvider";
import { Subscription } from "stompjs";

interface Command {
  fromUser: number;
  toDevice: number;
  command: string;
  timestamp: string; // Измените тип, если необходимо
  body: Record<string, any>;
}

enum CommandEnum {
  START_SENDING_SEGMENTS_DATA = "START_SENDING_SEGMENTS_DATA",
  STOP_SENDING_SEGMENTS_DATA = "STOP_SENDING_SEGMENTS_DATA",
  UPLOAD_SEGMENT = "UPLOAD_SEGMENT",
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

interface SegmentsWebSocketDto {
  segments: SegmentWebSocketData[];
}

const DeviceExample: React.FC = () => {
  const [sendingSegments, setSendingSegments] = useState<boolean | null>(false);
  const { stompClient } = useWebSocket();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const sendSegments = () => {
      // Генерация случайного числа сегментов от 1 до 5
      const numberOfSegments = Math.floor(Math.random() * 5) + 1;

      // Создание массива сегментов
      const segmentsArray: SegmentWebSocketData[] = [];

      // Заполнение массива сегментов случайными значениями
      for (let i = 0; i < numberOfSegments; i++) {
        const randomSegment: SegmentWebSocketData = {
          segmentName: `Segment${i + 1}`,
          durationMillis: Math.random() * 10000,
          status: "COMPLETED",
          startRecording: new Date().toISOString(),
          recordingSource: "RS_REAR",
          recordingResolution: "RES_480p",
          recordingMode: "RECORD_ALWAYS",
        };
        segmentsArray.push(randomSegment);
      }

      const segmentsDto: SegmentsWebSocketDto = {
        segments: segmentsArray,
      };

      // Отправка данных на топик
      // Замените на ваш код отправки данных на топик
      stompClient?.send("/app/segments/1", [], JSON.stringify(segmentsDto));
      console.log("Sending segments:", segmentsDto);
    };

    if (sendingSegments) {
      // Установка интервала отправки данных каждую секунду
      intervalId = setInterval(sendSegments, 1000);
    }

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [sendingSegments]);
  let commandSubscription: Subscription | null = null;

  const handleCommandSubscription = (message: any) => {
    try {
      const command: Command = JSON.parse(message.body);
      switch (command.command) {
        case CommandEnum.START_SENDING_SEGMENTS_DATA: {
          setSendingSegments(true);
          break;
        }
        case CommandEnum.STOP_SENDING_SEGMENTS_DATA: {
          setSendingSegments(false);
          break;
        }
      }
    } catch (error) {
      console.error("Error handling command subscription:", error);
    }
  };

  useEffect(() => {
    const connectAndSubscribe = () => {
      if (stompClient) {
        const deviceId = 1;

        const tryConnect = () => {
          try {
            commandSubscription = stompClient.subscribe(
              `/topic/commands/${deviceId}`,
              handleCommandSubscription
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
      commandSubscription?.unsubscribe();
    };
  }, [stompClient]);
  return <></>;
};

export default DeviceExample;
