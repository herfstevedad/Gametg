import { useRef } from 'react';
import { init, miniApp } from '@telegram-apps/sdk'

import Balance from './components/balance/balance';
import Monster from './components/monster/monster';

import './App.css'

function App() {
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

  const balanceRef = useRef<{ addCoins: (amount: number) => void } | null>(null);

  const handleMonsterDeath = (droppedCoins: number) => {
    if (balanceRef.current) {
      balanceRef.current.addCoins(droppedCoins);
    }
  };


  return (
    <div className={'game-container'}>
      <div className={'balance-container'}>
        <Balance ref={(ref) => { balanceRef.current = ref; }} />
      </div>
      <Monster onDeath={handleMonsterDeath} />
    </div>
  )

}



export default App
