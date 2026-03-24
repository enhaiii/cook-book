import { Storage } from "./storage.js";

const storage = new Storage();

document.querySelector('.sign_in').addEventListener('click', function() {
    window.location.href = 'login.html';
});

function getRecipeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Функция для безопасного отображения HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Загружаем рецепты и отображаем нужный
document.addEventListener('DOMContentLoaded', () => {
    const recipeId = getRecipeIdFromUrl();
    if (!recipeId) {
        console.error('ID рецепта не указан');
        document.body.innerHTML = '<h1>Ошибка: рецепт не найден</h1>';
        return;
    }

    // Загружаем JSON
    fetch('/static/data/recipe.json')
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
            return response.json();
        })
        .then(recipes => {
            const recipe = recipes.find(r => r.id == recipeId);
            if (!recipe) {
                throw new Error('Рецепт не найден');
            }

            // Заполняем заголовок, время, описание
            document.getElementById('recipeTitle').textContent = recipe.title;
            document.getElementById('recipeDescription').textContent = recipe.description;

            // Ингредиенты
            const ingredientsContainer = document.getElementById('ingredientsList');
            if (ingredientsContainer && recipe.ingredients) {
                ingredientsContainer.innerHTML = '';
                recipe.ingredients.forEach(ing => {
                    const div = document.createElement('div');
                    div.className = 'parametrs';
                    div.innerHTML = `
                        <p class="name_parametr">${escapeHtml(ing.name)}</p>
                        <p class="weight_parametr">${escapeHtml(ing.count)}</p>
                    `;
                    ingredientsContainer.appendChild(div);
                });
            }

            // Шаги приготовления
            const stepsContainer = document.getElementById('stepsContainer');
            if (stepsContainer && recipe.steps) {
                stepsContainer.innerHTML = '';
                recipe.steps.forEach(step => {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'step';
                    stepDiv.innerHTML = `
                        <p class="name_step">${escapeHtml(step.name)}</p>
                        <p class="description_step">${escapeHtml(step.description)}</p>
                        ${step.img ? `<img src="${step.img}" alt="step" class="image_step">` : ''}
                    `;
                    stepsContainer.appendChild(stepDiv);
                });

                // Добавляем блок "Приятного аппетита", если его нет в JSON
                const bonAppetit = document.createElement('div');
                bonAppetit.className = 'bon_appetit';
                bonAppetit.innerHTML = `
                    <p class="message">Приятного аппетита!</p>
                    <img src="./static/media/Smile.svg" alt="smile">
                `;
                stepsContainer.appendChild(bonAppetit);
            }

            // Опционально: установка главного изображения
            const mainImage = document.querySelector('.title_image');
            if (mainImage && recipe.img) {
                mainImage.src = recipe.img;
                mainImage.alt = recipe.title;
            }

        })
        .catch(error => {
            console.error('❌ Ошибка загрузки рецепта:', error);
            document.body.innerHTML = '<h1 style="text-align:center;margin-top:100px;">😕 Рецепт не найден</h1>';
        });
});