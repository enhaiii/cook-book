import defaultUsers from "../data/allUsers.json" with {type: 'json'}
import defaultRecipes from "../data/recipe.json" with {type: 'json'}
import defaultComments from "../data/comments.json" with {type: 'json'}

export class Storage {
    saveUsers = (users) => {
        localStorage.setItem("users", JSON.stringify(users))
    }

    saveUser = (user, users) => {
        users.push(user)
        this.saveUsers(users)
    }
    
    getUsers = () => {
        let users = localStorage.getItem("users")

        if (users !== null && users !== undefined) {
            return JSON.parse(users)
        } else {
            // Исправлено: allUsers → defaultUsers
            this.saveUsers(defaultUsers)
            return defaultUsers
        }
    }

    getCurrentUser = () => {
        const currentUser = localStorage.getItem("currentUser")
        return currentUser ? JSON.parse(currentUser) : null
    }

    setCurrentUser = (currentUser) => {
        localStorage.setItem("currentUser", JSON.stringify(currentUser))
    }
    
    updateUser = (userId, updates) => {
        let users = this.getUsers();
        const index = users.findIndex(u => u.id == userId);
        if (index !== -1) {
            // Объединяем старые данные с новыми (новые перезаписывают старые)
            users[index] = { ...users[index], ...updates };
            this.saveUsers(users);
            
            // Обновляем текущего пользователя, если это он
            const current = this.getCurrentUser();
            if (current && current.id == userId) {
                this.setCurrentUser(users[index]);
            }
            return users[index];
        }
        return null;
    };

    logout = () => {
        localStorage.removeItem("currentUser")
    }

    saveRecipe = (recipes) => {
        localStorage.setItem("Recipes", JSON.stringify(recipes))
    }

    getRecipe = () => {
        const recipes = localStorage.getItem("Recipes")

        if (recipes !== null) {
            return JSON.parse(recipes)
        } else {
            // Исправлено: defaultRecipes (ранее был defaultMovies)
            this.saveRecipe(defaultRecipes)
            return defaultRecipes
        }
    }

    saveCurrentRecipe = (recipe) => {
        localStorage.setItem("currentRecipe", JSON.stringify(recipe))
    }

    getCurrentRecipe = () => {
        let currentRecipe = localStorage.getItem("currentRecipe")
        return currentRecipe ? JSON.parse(currentRecipe) : null
    }

    saveComments = (comments) => {
        try {
            localStorage.setItem("Comments", JSON.stringify(comments));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Слишком много комментариев, часть будет удалена');
                // Удаляем половину старых комментариев
                comments.splice(0, Math.floor(comments.length / 2));
                localStorage.setItem("Comments", JSON.stringify(comments));
            } else throw e;
        }
    };

    updateRecipeAverageRating = (recipeId) => {
        const recipes = this.getRecipe();
        const recipeIndex = recipes.findIndex(r => r.id == recipeId);
        if (recipeIndex === -1) return;

        const comments = this.getComments();
        const recipeComments = comments.filter(c => c.recipeId == recipeId && c.rating);
        if (recipeComments.length === 0) {
            recipes[recipeIndex].rating = { average: 0, count: 0 };
        } else {
            const sum = recipeComments.reduce((acc, c) => acc + c.rating, 0);
            const average = sum / recipeComments.length;
            recipes[recipeIndex].rating = {
                average: Number(average.toFixed(1)),
                count: recipeComments.length
            };
        }
        this.saveRecipe(recipes);
    };

// Обновлённый getComments с обогащением
    getComments = () => {
        let comments = localStorage.getItem("Comments");
        let parsedComments;
        
        try {
            parsedComments = comments ? JSON.parse(comments) : defaultComments;
        } catch (e) {
            console.error('Ошибка парсинга Comments, загружаем defaultComments', e);
            // Удаляем повреждённые данные
            localStorage.removeItem("Comments");
            parsedComments = defaultComments;
            this.saveComments(defaultComments);
        }
        
        let users = this.getUsers();
        // Обогащаем комментарии...
        parsedComments = parsedComments.map(comment => {
            if (!comment.userName || !comment.userAvatar) {
                const user = users.find(u => u.id == comment.userId);
                if (user) {
                    comment.userName = user.name;
                    comment.userAvatar = user.avatar || './static/media/default-avatar.svg';
                } else {
                    comment.userName = 'Пользователь';
                    comment.userAvatar = './static/media/default-avatar.svg';
                }
            }
            return comment;
        });
        
        return parsedComments;
    };

    saveComment = (userId, recipeId, comm, date, rating = null) => {
        let comments = this.getComments();
        let users = this.getUsers();
        const user = users.find(u => u.id == userId);
        if (!user) return;

        const newComment = {
            id: comments.length + 1,
            recipeId: recipeId,
            userId: userId,
            userName: user.name,
            userAvatar: user.avatar || './static/media/avatar.svg', // обязательно
            comm: comm,
            rating: rating,
            date: date || new Date().toLocaleDateString('ru-RU')
        };
        comments.push(newComment);
        this.saveComments(comments);
    };

    saveRaiting = (userId, recipeId, value) => {
        let users = this.getUsers()
        const user = users.find(u => u.id == userId)
        if (user) {
            if (!user.grades) user.grades = {}
            user.grades[String(recipeId)] = Number(value)
            this.saveUsers(users)
        }
    }

    saveRaitingCurrentUser = (userId, recipeId, value) => {
        let users = this.getUsers()
        const userIndex = users.findIndex(u => u.id == userId)
        if (userIndex !== -1) {
            if (!users[userIndex].grades) users[userIndex].grades = {}
            users[userIndex].grades[String(recipeId)] = Number(value)
            this.saveUsers(users)
            this.setCurrentUser(users[userIndex])
            return this.getCurrentUser()
        }
        return null
    }

    searchRecipes = (searchQuery) => {
        const allRecipes = this.getRecipe()
        if (!searchQuery || searchQuery.trim() === "") return allRecipes
        const query = searchQuery.toLowerCase().trim()
        return allRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(query) ||
            (recipe.description && recipe.description.toLowerCase().includes(query))
        )
    }
    // storage.js — добавьте этот метод в класс Storage

    toggleFavorite = (userId, recipeId) => {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id == userId);
        if (userIndex === -1) return null;

        const favorites = users[userIndex].favorites || [];
        const index = favorites.indexOf(Number(recipeId));

        if (index === -1) {
            favorites.push(Number(recipeId));
        } else {
            favorites.splice(index, 1);
        }

        users[userIndex].favorites = favorites;
        this.saveUsers(users);

        // Обновляем текущего пользователя, если это он
        const current = this.getCurrentUser();
        if (current && current.id == userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return users[userIndex];
    };
}
