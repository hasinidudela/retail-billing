// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check local storage
if (localStorage.getItem('theme') === 'dark') {
    body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙 Dark Mode';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
        }
    });
}

// Highlight active link
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    if (link.getAttribute('href').includes(currentPath.split('/').pop())) {
        link.classList.add('active');
    }
});
