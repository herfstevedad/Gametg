import { useRef, useState } from 'react';
import { init, miniApp } from '@telegram-apps/sdk'

import Balance from './components/balance/balance';
import Monster from './components/monster/monster';
import Modal from './components/modal/modal';

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleMonsterDeath = (droppedCoins: number) => {
    if (balanceRef.current) {
      balanceRef.current.addCoins(droppedCoins);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={'game-container'}>
      <div className={'balance-container'}>
        <Balance ref={(ref) => { balanceRef.current = ref; }} />
      </div>
      <Monster onDeath={handleMonsterDeath} />

      <button className={'openModalButton'} onClick={openModal}>
        Открыть меню
      </button>

      {/* Модальное окно */}
      {isModalOpen && <Modal onClose={closeModal} />}
    </div>
  )

}



export default App
