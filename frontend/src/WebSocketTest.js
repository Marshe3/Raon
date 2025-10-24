import React, { useEffect, useState } from 'react';

const WebSocketTest = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080/ws/signal"); // Spring Boot 포트에 맞춤
    setWs(socket);

    socket.onopen = () => {
      console.log("✅ WebSocket 연결됨");
    };

    socket.onmessage = (e) => {
      setMessages(prev => [...prev, `상대: ${e.data}`]);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket 연결 종료됨");
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(input);
      setMessages(prev => [...prev, `나: ${input}`]);
      setInput('');
    }
  };

  return (
    <div>
      <h2>💬 WebSocket 테스트</h2>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>보내기</button>
      <ul>
        {messages.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
};

export default WebSocketTest;