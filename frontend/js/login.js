/**
 * login.js
 * Lógica de autenticación y perfil de usuario para el frontend.
 * - Registra nuevos usuarios usando la API POST /api/users.
 * - Inicia sesión con POST /api/users/login.
 * - Mantiene la sesión en localStorage.
 * - Actualiza y elimina usuario con PUT /api/users/:id y DELETE /api/users/:id.
 */
const CURRENT_USER_KEY = 'currentUser';
const USERS_API_URL = `${API_BASE_URL}/api/users`;

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function showLoginNotification(message, isError = false) {
    const notification = document.getElementById('loginNotification');
    if (!notification) return;

    const text = notification.querySelector('.notification-text p');
    if (text) text.textContent = message;
    notification.classList.add('show');
    notification.classList.toggle('error', isError);
}

function showRegisterMessage(message, isError = false) {
    const messageEl = document.getElementById('registerMessage');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.classList.toggle('error', isError);
    messageEl.classList.toggle('success', !isError);
}

function showConfigMessage(message, isError = false) {
    const messageEl = document.getElementById('configMessage');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.classList.toggle('error', isError);
    messageEl.classList.toggle('success', !isError);
}

async function registerUser() {
    const firstName = document.getElementById('nameInput')?.value.trim();
    const lastName = document.getElementById('lastNameInput')?.value.trim();
    const email = document.getElementById('emailInput')?.value.trim();
    const password = document.getElementById('passwordInput')?.value;

    if (!firstName || !email || !password) {
        showRegisterMessage('Completa los campos de nombre, correo y contraseña.', true);
        return;
    }

    const name = lastName ? `${firstName} ${lastName}` : firstName;

    try {
        const response = await fetch(USERS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al crear usuario');
        }

        setCurrentUser({ id: data.id, name, email });
        showRegisterMessage('Cuenta creada correctamente, redirigiendo a login...', false);

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    } catch (error) {
        showRegisterMessage(error.message, true);
    }
}

async function loginUser() {
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        showLoginNotification('Ingresa tu correo y contraseña.', true);
        return;
    }

    try {
        const response = await fetch(`${USERS_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error de autenticación');
        }

        setCurrentUser(data);
        showLoginNotification('Login correcto. Redirigiendo...', false);

        setTimeout(() => {
            window.location.href = 'perfil.html';
        }, 1000);
    } catch (error) {
        showLoginNotification(error.message, true);
    }
}

function hideNotificationById(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
    if (el) el.classList.remove('error');
}

function hideNotification() {
    hideNotificationById('successNotification');
    hideNotificationById('loginNotification');
    hideNotificationById('recoveryNotification');
    hideNotificationById('backupNotification');
    hideNotificationById('errorNotification');
}

window.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadUserSettings();
});

function loadUserProfile() {
    const user = getCurrentUser();
    const nameEl = document.getElementById('profileUserName');
    const emailEl = document.getElementById('profileUserEmail');
    const userNameElements = document.querySelectorAll('.user-name');

    if (!user) {
        if (nameEl) nameEl.textContent = 'Usuario';
        if (emailEl) emailEl.textContent = '';
        if (userNameElements.length) {
            userNameElements.forEach(el => el.textContent = 'Usuario');
        }
        return;
    }

    if (nameEl) nameEl.textContent = user.name || 'Usuario';
    if (emailEl) emailEl.textContent = user.email ? `Correo: ${user.email}` : '';
    if (userNameElements.length) {
        userNameElements.forEach(el => el.textContent = user.name || 'Usuario');
    }
}

function loadUserSettings() {
    const user = getCurrentUser();
    if (!user) return;

    const nameParts = user.name ? user.name.split(' ') : [];
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || '';

    const nameField = document.getElementById('configNameInput');
    const lastNameField = document.getElementById('configLastNameInput');
    const emailField = document.getElementById('configEmailInput');
    const genderField = document.getElementById('configGenderSelect');

    if (nameField) nameField.value = firstName;
    if (lastNameField) lastNameField.value = lastName;
    if (emailField) emailField.value = user.email || '';
    if (genderField) genderField.value = user.gender || '';
}

async function updateCurrentUser() {
    const user = getCurrentUser();
    if (!user) {
        showConfigMessage('No hay sesión iniciada.', true);
        return;
    }

    const firstName = document.getElementById('configNameInput')?.value.trim();
    const lastName = document.getElementById('configLastNameInput')?.value.trim();
    const email = document.getElementById('configEmailInput')?.value.trim();
    const name = lastName ? `${firstName} ${lastName}` : firstName;

    if (!firstName || !email) {
        showConfigMessage('Completa nombre y correo antes de guardar.', true);
        return;
    }

    try {
        const response = await fetch(`${USERS_API_URL}/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo actualizar el usuario');
        }

        setCurrentUser({ ...user, name, email });
        showConfigMessage('Datos actualizados con éxito.', false);
        loadUserProfile();
    } catch (error) {
        showConfigMessage(error.message, true);
    }
}

async function deleteCurrentUser() {
    const user = getCurrentUser();
    if (!user) {
        showConfigMessage('No hay usuario activo.', true);
        return;
    }

    const confirmDelete = confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${USERS_API_URL}/${user.id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'No se pudo eliminar la cuenta');
        }

        clearCurrentUser();
        window.location.href = 'login.html';
    } catch (error) {
        showConfigMessage(error.message, true);
    }
}

/**
 * Cambia la contraseña del usuario actualmente autenticado.
 * Valida campos locales y llama al endpoint PUT /api/users/:id.
 */
async function changePassword() {
    const user = getCurrentUser();
    if (!user) {
        showPasswordMessage('No hay sesión activa.', true);
        return;
    }

    const currentPassword = document.getElementById('currentPasswordInput')?.value;
    const newPassword = document.getElementById('newPasswordInput')?.value;
    const confirmPassword = document.getElementById('confirmPasswordInput')?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordMessage('Completa todos los campos de contraseña.', true);
        return;
    }

    if (newPassword !== confirmPassword) {
        showPasswordMessage('Las contraseñas nuevas no coinciden.', true);
        return;
    }

    try {
        const response = await fetch(`${USERS_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: currentPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Contraseña actual incorrecta.');
        }

        const updateResponse = await fetch(`${USERS_API_URL}/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        });

        const updateData = await updateResponse.json();
        if (!updateResponse.ok) {
            throw new Error(updateData.message || 'No se pudo actualizar la contraseña.');
        }

        showPasswordMessage('Contraseña actualizada correctamente.', false);
        closeModal();
    } catch (error) {
        showPasswordMessage(error.message, true);
    }
}

function showPasswordMessage(message, isError = false) {
    const messageEl = document.getElementById('passwordMessage');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.classList.toggle('error', isError);
    messageEl.classList.toggle('success', !isError);
}
