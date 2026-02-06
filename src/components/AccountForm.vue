<template>
  <div class="account-form-container">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="primary" :icon="Plus" @click="addAccount">
        Добавить
      </el-button>
    </div>

    <el-alert
      title="Подсказка: Метки вводятся через точку с запятой (;)"
      type="info"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <div class="form-grid header-row">
      <div>Метки</div>
      <div>Тип записи</div>
      <div>Логин</div>
      <div>Пароль</div>
      <div></div> </div>

    <div v-for="(acc, index) in store.accounts" :key="acc.id" class="account-row">
      
      <div class="grid-cell">
        <el-input
          v-model="acc._rawLabels"
          placeholder="Метка1; Метка2"
          @blur="handleLabelBlur(acc)"
          :class="{ 'is-error': acc.isLabelValid === false }"
          maxlength="50"
        />
        <div v-if="acc.isLabelValid === false" class="error-text">Макс. 50 символов</div>
      </div>

      <div class="grid-cell">
        <el-select 
          v-model="acc.type" 
          @change="handleTypeChange(acc)"
          placeholder="Тип"
        >
          <el-option label="LDAP" value="LDAP" />
          <el-option label="Локальная" value="Local" />
        </el-select>
      </div>

      <div class="grid-cell">
        <el-input
          v-model="acc.login"
          placeholder="Логин"
          @blur="validateLogin(acc)"
          :class="{ 'is-error': acc.isLoginValid === false }"
          maxlength="100"
        />
        <div v-if="acc.isLoginValid === false" class="error-text">Обязательно, макс 100</div>
      </div>

      <div class="grid-cell">
        <div v-if="acc.type === 'Local'">
          <el-input
            v-model="acc.password"
            type="password"
            show-password
            placeholder="Пароль"
            @blur="validatePassword(acc)"
            :class="{ 'is-error': acc.isPasswordValid === false }"
            maxlength="100"
          />
          <div v-if="acc.isPasswordValid === false" class="error-text">Обязательно, макс 100</div>
        </div>
      </div>

      <div class="grid-cell action-cell">
        <el-button type="danger" :icon="Delete" circle @click="store.removeAccount(acc.id)" />
      </div>
    </div>
    
    <div v-if="store.accounts.length === 0" class="empty-state">
      Нет учетных записей. Нажмите "+", чтобы добавить.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAccountStore } from '@/stores/accountStore';
import { Delete, Plus } from '@element-plus/icons-vue';
import type { Account } from '@/types';

const store = useAccountStore();

onMounted(() => {
  store.init();
});

const addAccount = () => {
  store.addAccount();
};

// --- Логика валидации и обработки ---

// 1. Обработка Меток (String -> Object Array)
const handleLabelBlur = (acc: Account) => {
  // Валидация длины строки (хотя maxlength в input уже ограничивает ввод)
  if (acc._rawLabels.length > 50) {
    acc.isLabelValid = false;
    return;
  }
  acc.isLabelValid = true;

  // Преобразование строки "a; b; c" -> [{text: 'a'}, {text: 'b'}]
  const textArray = acc._rawLabels
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  acc.labels = textArray.map(text => ({ text }));
};

// 2. Обработка смены типа
const handleTypeChange = (acc: Account) => {
  if (acc.type === 'LDAP') {
    acc.password = null;
    acc.isPasswordValid = true; // Для LDAP пароль валиден всегда (его нет)
  } else {
    // Если переключили на Local, сбрасываем пароль в пустую строку, чтобы можно было ввести
    acc.password = ''; 
    acc.isPasswordValid = false; // Сразу помечаем как невалидный, пока не введут
  }
};

// 3. Валидация Логина
const validateLogin = (acc: Account) => {
  if (!acc.login || acc.login.trim() === '' || acc.login.length > 100) {
    acc.isLoginValid = false;
  } else {
    acc.isLoginValid = true;
  }
};

// 4. Валидация Пароля
const validatePassword = (acc: Account) => {
  if (acc.type === 'LDAP') return; // Не валидируем для LDAP

  if (!acc.password || acc.password.trim() === '' || acc.password.length > 100) {
    acc.isPasswordValid = false;
  } else {
    acc.isPasswordValid = true;
  }
};
</script>

<style scoped lang="scss">
.account-form-container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
  }
}

.mb-4 {
  margin-bottom: 20px;
}

/* Сетка таблицы */
.form-grid {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 2fr 50px;
  gap: 15px;
  align-items: start;
}

.header-row {
  font-weight: bold;
  color: #606266;
  margin-bottom: 10px;
  padding: 0 10px;
}

.account-row {
  @extend .form-grid;
  margin-bottom: 15px;
  align-items: flex-start; // Чтобы инпуты были сверху, если появятся сообщения об ошибках
}

.grid-cell {
  display: flex;
  flex-direction: column;
}

.action-cell {
  align-items: center;
  justify-content: center;
  height: 32px; // высота стандартного инпута, чтобы кнопка была по центру строки
}

.error-text {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

/* Красная обводка для Element Plus инпутов при ошибке */
/* Используем deep selector, так как мы стилизуем внутренности компонента Element Plus */
:deep(.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}
</style>