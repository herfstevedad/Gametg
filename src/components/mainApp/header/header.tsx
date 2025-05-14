import styles from "./header.module.css";

interface HeaderProps {
  onRegistrationOpen: () => void;
}

const formatGroupCode = (code: string): string => {
  if (!code || code === "Выбрать группу") return code;
  
  // Конвертация кода группы
  const groupMap: { [key: string]: string } = {
    'A': 'А', 'V': 'В', 'D': 'Д', 'KS': 'КС', 'L': 'Л',
    'P': 'П', 'PM': 'ПМ', 'R': 'Р', 'S': 'С', 'SP': 'СП',
    'E': 'Э', 'ES': 'ЭС'
  };

  // Находим префикс группы (буквы)
  let prefix = '';
  let numbers = '';
  
  if (code.includes('KS') || code.includes('PM') || code.includes('SP') || code.includes('ES')) {
    prefix = code.slice(0, 2);
    numbers = code.slice(2);
  } else {
    prefix = code.slice(0, 1);
    numbers = code.slice(1);
  }

  // Преобразуем номер группы (например, '11' в '-1-1')
  const course = numbers[0];
  const group = numbers[1];
  
  return `${groupMap[prefix] || prefix}-${course}-${group}`;
};

const Header: React.FC<HeaderProps> = ({ onRegistrationOpen }) => {
  const group = localStorage.getItem("selectedGroup") || "Выбрать группу";
  const formattedGroup = formatGroupCode(group);
  
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <p>Расписание</p>
        <button onClick={onRegistrationOpen}>
          {formattedGroup}
        </button>
      </div>
    </header>
  );
};

export default Header;