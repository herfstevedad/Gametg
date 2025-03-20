import { init, miniApp } from '@telegram-apps/sdk'
import Registration from './components/registration/registration';

import './App.css'

function App() {

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
      <Registration />
    </div>
  )
};

export default App
