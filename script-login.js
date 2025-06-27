document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messageBox = document.getElementById('message-box');
    const formTitle = document.getElementById('form-title');
    const toggleText = document.getElementById('toggle-text');

    function switchToRegister() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        formTitle.textContent = 'Buat Akun Baru';
        toggleText.innerHTML = 'Sudah punya akun? <a href="#" id="show-login" class="font-medium text-indigo-400 hover:underline">Login</a>';
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            switchToLogin();
        });
    }

    function switchToLogin() {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        formTitle.textContent = 'Masuk untuk melanjutkan';
        toggleText.innerHTML = 'Belum punya akun? <a href="#" id="show-register" class="font-medium text-indigo-400 hover:underline">Daftar sekarang</a>';
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            switchToRegister();
        });
    }

    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegister();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('database.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', username, password })
        });

        const result = await response.json();
        
        messageBox.textContent = result.message;
        if (result.success) {
            messageBox.className = 'mt-4 text-center text-sm font-medium text-green-400';
            window.location.href = 'index.html'; // Redirect to main application page
        } else {
            messageBox.className = 'mt-4 text-center text-sm font-medium text-red-400';
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch('database.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', username, email, password })
        });

        const result = await response.json();

        messageBox.textContent = result.message;
        if (result.success) {
            messageBox.className = 'mt-4 text-center text-sm font-medium text-green-400';
             setTimeout(() => {
                switchToLogin();
                messageBox.textContent = ''; // Clear message after switching
             }, 2000);
        } else {
            messageBox.className = 'mt-4 text-center text-sm font-medium text-red-400';
        }
    });
});
