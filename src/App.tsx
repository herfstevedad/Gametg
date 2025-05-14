import { init, miniApp } from '@telegram-apps/sdk';
import { useState, useEffect } from 'react';
import Registration from './components/registration/registration';
import MainApp from './components/mainApp/mainApp';
import './App.css';

const App: React.FC = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const initializeTelegramSDK = async () => {
    try {
      await init();
      if (miniApp.ready.isAvailable()) {
        await miniApp.ready();
      }
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  };

  useEffect(() => {
    initializeTelegramSDK();
    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) {
      setSelectedGroup(savedGroup);
    } else {
      setIsRegistrationOpen(true);
    }
  }, []);

  // Второй вариант: чистим расписание перед установкой новой группы
  const handleGroupSelect = (serverGroup: string) => {
    localStorage.removeItem('schedule'); // Удаляем предыдущие данные расписания
    localStorage.setItem('selectedGroup', serverGroup);
    setSelectedGroup(serverGroup);
    setIsRegistrationOpen(false);
  };

  // Функция для открытия окна регистрации (передаётся в Header)
  const openRegistration = () => {
    setIsRegistrationOpen(true);
  };

  return (
    <div>
      <MainApp group={selectedGroup} onRegistrationOpen={openRegistration} />
      {isRegistrationOpen && (
        <Registration
          onClose={() => setIsRegistrationOpen(false)}
          onGroupSelect={handleGroupSelect}
        />
      )}
    </div>
  );
};

export default App;