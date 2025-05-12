// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import ChatProvider from "./contexts/ChatContext";
import { ChatServiceProvider } from "./poviders/ChatServiceProvider";

function App() {
  return (
    <ChatServiceProvider websocketUrl="https://www.gamjeongjung.co.kr/api/wss">
      <ChatProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ChatProvider>
    </ChatServiceProvider>
  );
}

export default App;