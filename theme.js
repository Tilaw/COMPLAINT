// Theme Toggle Logic
function initTheme() {
  const savedTheme = localStorage.getItem('taslim_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('taslim_theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const btns = document.querySelectorAll('.theme-toggle-btn');
  btns.forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  });
}

// Initialize on load to prevent flash
initTheme();
document.addEventListener('DOMContentLoaded', initTheme);
