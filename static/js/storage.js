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
        localStorage.setItem("Comments", JSON.stringify(comments))
    }

    getComments = () => {
        const comments = localStorage.getItem("Comments")
        return comments ? JSON.parse(comments) : defaultComments
    }

    saveComment = (userId, recipeId, comm, date) => {
        let comments = this.getComments()
        let users = this.getUsers()
        
        const user = users.find(u => u.id == userId)
        if (!user) {
            console.error('Пользователь не найден')
            return
        }

        let comment = {
            "id": comments.length + 1,
            "recipeId": recipeId,
            "userId": userId,
            "comm": comm,
            "date": date || new Date().toLocaleDateString()
        }

        if (!user.comments) user.comments = []
        user.comments.push(comment.id)
        comments.push(comment)
        
        this.saveComments(comments)
        this.saveUsers(users)
        
        const currentUser = this.getCurrentUser()
        if (currentUser && currentUser.id == user.id) {
            this.setCurrentUser(user)
        }
    }

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
}