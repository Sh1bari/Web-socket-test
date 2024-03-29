import React, { useState} from 'react';
import Stomp from 'stompjs';

interface Message {
  content: string;
}

const WebSocketComponent: React.FC = () => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);

  const socketUrl = 'http://localhost:8082/api/ws'; // Замените на ваш URL сервера WebSocket

  const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic3ViVHlwZSI6ImRldmljZSIsInRva2VuVHlwZSI6ImFjY2Vzcy10b2tlbiIsImRldmljZUlkIjoiMSIsImlhdCI6MTcwNjkxNDAwMn0.Lk3wuM7_QQ8YxgmUs4eZfXf5PB8BFaOZc0uLR6aaDK8` // Замените на ваш токен аутентификации
  };

  const handleConnect = () => {
    const socket = new window.SockJS(socketUrl);
    const stomp = Stomp.over(socket);
    setStompClient(stomp);

    stomp.connect(headers, () => {
      console.log('WebSocket connected');
      stomp.subscribe('/topic/commands/4', (message) => {
        const receivedMessage: Message = JSON.parse(message.body);
        setReceivedMessages((prevMessages) => [...prevMessages, receivedMessage.content]);
      }, headers);
    });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '' && stompClient) {
  
      stompClient.send('/app/commands/4', headers, JSON.stringify({ message: inputMessage }));
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
        <button onClick={handleConnect}>Connect</button>
      </div>
      <div>
        <h2>Received Messages:</h2>
        <ul>
          {receivedMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketComponent;