import defaultUsers from "../data/allUsers.json" with {type: 'json'}
import defaultMovies from "../data/recipe.json" with {type: 'json'}
import defaultReviews from "../data/comments.json" with {type: 'json'}

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
            this.saveUsers(allUsers)
            return allUsers
        }
    }

    getCurrentUser = () => {
        const currentUser = localStorage.getItem("currentUser")

        if (currentUser) {
            return JSON.parse(currentUser)
        } else {
            return null
        }
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
            this.saveRecipe(defaultRecipes)
            return defaultRecipes
        }
    }

    saveCurrentRecipe = (recipe) => {
        localStorage.setItem("currentRecipe", JSON.stringify(recipe))
    }

    getCurrentRecipe = () => {
        let currentRecipe = localStorage.getItem("currentRecipe")

        if (currentRecipe !== null) {
            return JSON.parse(currentRecipe)
        } else {
            return null
        }
    }

    saveComments = (comments) => {
        localStorage.setItem("Comments", JSON.stringify(comments))
    }

    getComments = () => {
        const comments = localStorage.getItem("Comments")

        if (comments !== null) {
            return JSON.parse(comments)
        } else {
            this.saveComments(defaultComments)
            return defaultComments
        }
    }

    saveComment = (userId, recipeId, comm, date) => {

        let comments = this.getComments()
        let users = this.getUsers()

        let comment = {
            "id": comments.length + 1,
            "recipeId": recipeId,
            "userId": userId,
            "comm": comm,
            "date": date
        }

        users[Number(userId) - 1].comments.push(comment.id)
        comments.push(comment)
        this.saveComments(comments)
        this.saveUsers(users)
        this.setCurrentUser(users[Number(userId) - 1])
    }

    saveRaiting = (userId, recipeId, value) => {
        let users = this.getUsers()

        for (let i = 0; i < users.length; i++) {

            if (users[i].id === userId) {
                users[i].grades[String(recipeId)] =  Number(value)
                break
            }
        }

        this.saveUsers(users)
    }

    saveRaitingCurrentUser = (userId, recipeId, value) => {
        let users = this.getUsers()

        for (let i = 0; i < users.length; i++) {

            if (users[i].id === userId) {
                users[i].grades[String(recipeId)] =  Number(value)
                break
            }
        }

        this.saveUsers(users)
        this.setCurrentUser(users[userId - 1])
        return this.getCurrentUser()
    }
}