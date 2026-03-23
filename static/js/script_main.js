import { Storage } from "./storage.js";

const storage = new Storage()

document.addEventListener('DOMContentLoaded', function() {
    const arrow = document.getElementById('arrow');
    const menu = document.getElementById('categoryMenu');

    if (arrow && menu) {
        arrow.addEventListener('click', function(event) {
            event.preventDefault()

            menu.classList.toggle('hidden')

            arrow.classList.toggle('rotated')
        })
    }
});