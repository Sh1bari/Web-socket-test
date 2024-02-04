// Header.tsx
import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const Header: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>('');

  const handleApplyToken = () => {
    localStorage.setItem('token', tokenInput);
    setTokenInput('');
  };

  const handleClearToken = () => {
    localStorage.removeItem('token');
    setTokenInput('');
  };

  return (
    <header className="bg-secondary header-container text-white p-3">
      <div className="container">
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Введите токен"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <Button variant="primary" onClick={handleApplyToken}>
            Применить
          </Button>
          <Button variant="danger" onClick={handleClearToken}>
            Очистить
          </Button>
        </InputGroup>
      </div>
    </header>
  );
};

export default Header;
