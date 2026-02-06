export type AccountType = 'LDAP' | 'Local';

export interface LabelItem {
  text: string;
}

export interface Account {
  id: string; // Уникальный ID для ключей списка
  labels: LabelItem[]; // Требование ТЗ: массив объектов
  type: AccountType;
  login: string;
  password: string | null;
  
  // Вспомогательное поле для привязки v-model инпута меток. 
  // Мы будем хранить здесь строку "текст; текст", а при блюре парсить её в labels.
  _rawLabels: string; 
  
  // Поля для статуса валидации (чтобы подсвечивать красным)
  isLoginValid?: boolean;
  isPasswordValid?: boolean;
  isLabelValid?: boolean;
}