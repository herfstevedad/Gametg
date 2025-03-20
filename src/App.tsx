import { init, miniApp } from '@telegram-apps/sdk'
import Registration from './components/registration/registration';

import './App.css'

function App() {
  //Переменные

  //Переменные

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
    <div>
      <h1>Приложение расписания</h1>
      <Registration />
    </div>
  );
};

export default App
