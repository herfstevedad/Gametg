import { init, miniApp } from '@telegram-apps/sdk';
import { useState, useEffect } from 'react';
import Registration from './components/registration/registration';
import MainApp from './components/mainApp/mainApp';
import './App.css';

const App: React.FC = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
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
    //const savedGroup = localStorage.getItem('selectedGroup');
    //setSelectedGroup(savedGroup);
    setIsRegistrationOpen(true); // Показываем регистрацию только если нет сохранённой группы
  }, []);

  const handleGroupSelect = (serverGroup: string) => {
    //localStorage.setItem('selectedGroup', serverGroup);
    setSelectedGroup(serverGroup);
    setIsRegistrationOpen(false);
  };

  return (
    <div>
      <MainApp group={selectedGroup} />
      {isRegistrationOpen && (
        <Registration 
          onClose={() => setIsRegistrationOpen(false)} 
          onGroupSelect={handleGroupSelect} // Теперь передаём функцию
        />
      )}
    </div>
  );
};

export default App;