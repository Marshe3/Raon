let socket = null;

export const connectSocket = (onMessage) => {
  socket = new WebSocket('ws://localhost:8080/ws/signal'); // Spring Boot 경로

  socket.onopen = () => {
    console.log('✅ WebSocket 연결됨');
  };

  socket.onmessage = (event) => {
    console.log('📩 받은 메시지:', event.data);
    if (onMessage) onMessage(event.data);
  };

  socket.onclose = () => {
    console.log('❌ WebSocket 연결 종료');
  };
};

export const sendMessage = (msg) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    console.warn('⚠️ WebSocket이 아직 연결되지 않았어요.');
  }
};