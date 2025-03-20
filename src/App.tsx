import { init, miniApp } from '@telegram-apps/sdk'


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
      1
    </div>
  );
};

export default App
