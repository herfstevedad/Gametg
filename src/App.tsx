import { init, miniApp } from '@telegram-apps/sdk'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Registration from './components/registration/registration';
import MainApp from './components/mainApp/mainApp';

import './App.css'

const App: React.FC = () => {

  //Запуск TelegramSDK
  const initializeTelegramSDK = async () => {
    try {
      await init();

      if (miniApp.ready.isAvailable()) {
        await miniApp.ready()
      }
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  }

  initializeTelegramSDK();
  //Запуск TelegramSDK


  return (
    <Router>
      <Routes>
        {/* Страница регистрации */}
        <Route path="/registration" element={<Registration />} />

        {/* Основное приложение */}
        <Route path="/app" element={<MainApp />} />

        {/* Перенаправление на /registration по умолчанию */}
        <Route path="*" element={<Navigate to="/registration" />} />
      </Routes>
    </Router>
  );
};

export default App
