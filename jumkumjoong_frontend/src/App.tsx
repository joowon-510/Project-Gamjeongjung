// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes"; // 인증 + 라우팅 처리
import ChatProvider from "./contexts/ChatContext";
import { ChatServiceProvider } from "./poviders/ChatServiceProvider";

function App() {
  return (
    <ChatServiceProvider websocketUrl="ws://115.85.181.195:8080/ws">
      <ChatProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ChatProvider>
    </ChatServiceProvider>
  );
}

export default App;
