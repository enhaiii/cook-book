import { Storage } from "./storage.js";

// Создаём экземпляр Storage
const storage = new Storage();

// Получаем элементы
const nameInput = document.getElementById('loginName');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

// Элементы для сообщений об ошибках
const nameFail = document.getElementById('nameFail');
const emailFail = document.getElementById('emailFail');
const passwordFail = document.getElementById('passwordFail');

// Сначала скрываем все сообщения об ошибках
[nameFail, emailFail, passwordFail].forEach(el => {
    if (el) el.style.display = 'none';
});

// Функция для показа ошибки
function showError(element, message = null) {
    if (element) {
        if (message) element.textContent = message;
        element.style.display = 'block';
    }
}

// Функция для скрытия ошибки
function hideError(element) {
    if (element) element.style.display = 'none';
}

// Функция для проверки формата email (допустимые домены)
function isValidEmail(email) {
    const allowedDomains = ['@gmail.com', '@mail.ru'];
    return allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
}

// Функция валидации для нового пользователя
function validateNewUser(name, email, password) {
    let isValid = true;
    
    // Проверка имени
    if (!name) {
        showError(nameFail, 'Имя не может быть пустым');
        isValid = false;
    } else {
        hideError(nameFail);
    }
    
    // Проверка email
    if (!email) {
        showError(emailFail, 'Email не может быть пустым');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError(emailFail, 'Почта должна оканчиваться на @gmail.com или @mail.ru');
        isValid = false;
    } else {
        hideError(emailFail);
    }
    
    // Проверка пароля
    if (!password) {
        showError(passwordFail, 'Пароль не может быть пустым');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordFail, 'Пароль должен быть не менее 6 символов');
        isValid = false;
    } else {
        hideError(passwordFail);
    }
    
    return isValid;
}

// Функция для проверки, существует ли пользователь с таким email
function findUserByEmail(users, email) {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Функция для создания нового пользователя
function createNewUser(name, email, password) {
    const users = storage.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => Number(u.id))) + 1 : 1;
    const newUser = {
        id: newId,
        name: name,
        email: email,
        password: password,
        favorites: [],
        reviews: [],
        grades: {},
        comments: []
    };
    users.push(newUser);
    storage.saveUsers(users);
    return newUser;
}

// Обработчик кнопки
loginBtn.addEventListener('click', () => {
    // Получаем введённые значения
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Сброс ошибок
    hideError(nameFail);
    hideError(emailFail);
    hideError(passwordFail);

    // Базовая проверка заполненности (будет дублироваться в validateNewUser, но оставим для логина)
    if (!name || !email || !password) {
        // Проходим по каждому полю и показываем ошибку, если пусто
        if (!name) showError(nameFail, 'Имя не может быть пустым');
        if (!email) showError(emailFail, 'Email не может быть пустым');
        if (!password) showError(passwordFail, 'Пароль не может быть пустым');
        return;
    }

    // Загружаем всех пользователей
    const users = storage.getUsers();
    const existingUser = findUserByEmail(users, email);

    if (existingUser) {
        // Пользователь с таким email существует – проверяем имя и пароль
        const nameMatches = existingUser.name === name;
        const passwordMatches = existingUser.password === password;

        if (!nameMatches && !passwordMatches) {
            showError(nameFail, 'Неверное имя');
            showError(passwordFail, 'Неверный пароль');
        } else if (!nameMatches) {
            showError(nameFail, 'Неверное имя');
        } else if (!passwordMatches) {
            showError(passwordFail, 'Неверный пароль');
        } else {
            // Всё верно – авторизуем
            storage.setCurrentUser(existingUser);
            window.location.href = 'profile.html';
        }
    } else {
        // Пользователя нет – проверяем валидность данных
        if (validateNewUser(name, email, password)) {
            const newUser = createNewUser(name, email, password);
            storage.setCurrentUser(newUser);
            window.location.href = 'profile.html';
        }
    }
});

// Обработка клавиши Enter
const inputs = [nameInput, emailInput, passwordInput];
inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});