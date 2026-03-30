import { Storage } from "./storage.js";

const storage = new Storage();

function truncateText(text, maxLength) {
    if (!text) return 'Описание отсутствует';
    if (text.length <= maxLength) return text;
    let truncated = text.substring(0, maxLength);
    let lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
        truncated = truncated.substring(0, lastSpace);
    }
    return truncated + '...';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded – инициализация страницы');
    const container = document.getElementById('recipesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const arrow = document.getElementById('arrow');
    const menu = document.getElementById('categoryMenu');

    console.log('searchInput:', searchInput);
    console.log('searchButton:', searchButton);

    if (!container) {
        console.error('Контейнер не найден');
        return;
    }

    let allRecipes = [];

    function loadAndDisplayRecipes(recipesToShow) {
        container.innerHTML = '';
        for (let recipe of recipesToShow) {
            const shortDescription = truncateText(recipe.description, 190);
            const cardHtml = `
                <a href="recipe.html?id=${recipe.id}">
                    <div class="card">
                        <div class="for_recipe" style="background-image: url('${recipe.img}'); background-size: cover; background-position: center;">
                            <div class="for_time">
                                <img src="./static/media/clock.svg" alt="clock" class="clock">
                                <p class="time">${recipe.cookingTime} мин</p>
                            </div>
                        </div>
                        <div class="text_block">
                            <p class="name_recipe">${recipe.title}</p>
                            <p class="description_recipe">${shortDescription}</p>
                        </div>
                    </div>
                </a>
            `;
            container.innerHTML += cardHtml;
        }
    }

    fetch('/static/data/recipe.json')
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
            return response.json();
        })
        .then(recipes => {
            allRecipes = recipes;
            console.log(`Загружено ${recipes.length} рецептов`);
            loadAndDisplayRecipes(allRecipes);

            // ===== КАТЕГОРИИ =====
            const categoryLinks = document.querySelectorAll('.name_category');
            categoryLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = link.textContent.trim();
                    console.log('Выбрана категория:', category);
                    const filtered = allRecipes.filter(recipe => {
                        if (recipe.categories && recipe.categories.includes(category)) return true;
                        if (recipe.tags && recipe.tags.includes(category)) return true;
                        return false;
                    });
                    loadAndDisplayRecipes(filtered);
                    if (menu) menu.classList.add('hidden');
                    if (arrow) arrow.classList.remove('rotated');
                    if (searchInput) searchInput.value = '';
                });
            });

            // ===== ПОИСК =====
            function searchRecipes() {
                const query = searchInput.value.trim().toLowerCase();
                console.log('Поиск по запросу:', query);
                if (query === '') {
                    loadAndDisplayRecipes(allRecipes);
                } else {
                    const filtered = allRecipes.filter(recipe =>
                        recipe.title.toLowerCase().includes(query)
                    );
                    console.log('Найдено рецептов:', filtered.length);
                    if (filtered.length === 0) {
                        container.innerHTML = '<div style="text-align:center;padding:60px;">😕 Рецепты не найдены</div>';
                    } else {
                        loadAndDisplayRecipes(filtered);
                    }
                }
            }

            if (searchButton) {
                console.log('Добавляем обработчик на кнопку поиска');
                searchButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Клик по кнопке поиска');
                    searchRecipes();
                });
            } else {
                console.warn('Кнопка поиска не найдена!');
            }

            if (searchInput) {
                console.log('Добавляем обработчик на input Enter');
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        console.log('Нажата Enter в поле поиска');
                        searchRecipes();
                    }
                });
            } else {
                console.warn('Поле ввода поиска не найдено!');
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки рецептов:', error);
            container.innerHTML = `<div style="text-align:center;padding:60px;">Не удалось загрузить рецепты</div>`;
        });

    // ===== МЕНЮ КАТЕГОРИЙ =====
    if (arrow && menu) {
        arrow.addEventListener('click', function(event) {
            event.preventDefault();
            menu.classList.toggle('hidden');
            arrow.classList.toggle('rotated');
        });
    }
});