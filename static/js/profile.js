import { Storage } from "./storage.js";

const storage = new Storage();

// Элементы DOM
const avatarImg = document.getElementById('avatar');
const changeAvatarBtn = document.getElementById('changeAvatar');
const avatarInput = document.getElementById('avatarInput');
const nameEl = document.getElementById('name');
const emailInput = document.getElementById('email');
const birthdateInput = document.getElementById('birthdate');
const maleRadio = document.getElementById('maleRadio');
const femaleRadio = document.getElementById('femaleRadio');
const saveBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = storage.getCurrentUser();
if (!currentUser) {
    alert('Пожалуйста, войдите в аккаунт');
    window.location.href = 'login.html';
}

// Загрузка данных пользователя
function loadUserData() {
    currentUser = storage.getCurrentUser();
    if (!currentUser) return;

    nameEl.textContent = currentUser.name;
    const avatarUrl = currentUser.avatar || './static/media/avatar.svg';
    avatarImg.src = avatarUrl;

    emailInput.value = currentUser.email || '';
    birthdateInput.value = currentUser.birthdate || '';

    if (currentUser.gender === 'male') {
        maleRadio.checked = true;
        femaleRadio.checked = false;
    } else if (currentUser.gender === 'female') {
        femaleRadio.checked = true;
        maleRadio.checked = false;
    } else {
        maleRadio.checked = false;
        femaleRadio.checked = false;
    }
}

// Сохранение аватарки (DataURL)
function saveAvatar(dataUrl) {
    const updated = storage.updateUser(currentUser.id, { avatar: dataUrl });
    if (updated) {
        avatarImg.src = dataUrl;
        alert('Аватарка обновлена');
    } else {
        alert('Ошибка при сохранении аватарки');
    }
}

// Обработчик кнопки "Изменить фото"
changeAvatarBtn.addEventListener('click', () => {
    avatarInput.click();
});

// Обработчик выбора файла
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла (только изображения)
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }

    // Ограничение размера (например, 2 МБ)
    if (file.size > 2 * 1024 * 1024) {
        alert('Размер изображения не должен превышать 2 МБ');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        saveAvatar(dataUrl);
    };
    reader.onerror = () => {
        alert('Ошибка чтения файла');
    };
    reader.readAsDataURL(file);

    // Очищаем input, чтобы можно было выбрать тот же файл повторно
    avatarInput.value = '';
});

// Валидация email
function isValidEmail(email) {
    const allowedDomains = ['@gmail.com', '@mail.ru'];
    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
}

// Сохранение данных профиля (email, дата, пол)
saveBtn.addEventListener('click', () => {
    const newEmail = emailInput.value.trim();
    const newBirthdate = birthdateInput.value;
    const newGender = maleRadio.checked ? 'male' : (femaleRadio.checked ? 'female' : null);

    if (!newEmail) {
        alert('Email не может быть пустым');
        return;
    }
    if (!isValidEmail(newEmail)) {
        alert('Email должен оканчиваться на @gmail.com или @mail.ru');
        return;
    }
    if (!newBirthdate) {
        alert('Укажите дату рождения');
        return;
    }
    if (!newGender) {
        alert('Укажите пол');
        return;
    }

    const updates = {
        email: newEmail,
        birthdate: newBirthdate,
        gender: newGender
    };

    const updated = storage.updateUser(currentUser.id, updates);
    if (updated) {
        alert('Данные обновлены');
        loadUserData();
    } else {
        alert('Ошибка при обновлении');
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    storage.logout();
    window.location.href = 'login.html';
});

// Инициализация
loadUserData();