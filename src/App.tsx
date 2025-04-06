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
      const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) {
      setSelectedGroup(savedGroup); // Устанавливаем сохраненную группу
    } else {
      setIsRegistrationOpen(true); // Показываем окно регистрации
    }
  }, []);

    const handleGroupSelect = (serverGroup: string) => {
      localStorage.setItem('selectedGroup', serverGroup); // Сохраняем группу в localStorage
      setSelectedGroup(serverGroup); // Устанавливаем группу в состоянии
      setIsRegistrationOpen(false); // Скрываем окно регистрации
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