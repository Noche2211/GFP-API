const DATA_API_BASE_URL = `${API_BASE_URL}/api/data`;

async function readApiResponse(response, fallbackMessage) {
    const contentType = response.headers.get('content-type') || '';
    const result = contentType.includes('application/json')
        ? await response.json()
        : null;

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`${fallbackMessage} Render no tiene disponible esta ruta. Verifica que el último despliegue incluya la API de datos.`);
        }
        throw new Error(result?.message || `${fallbackMessage} El servidor respondió con estado ${response.status}.`);
    }

    if (!result) {
        throw new Error(`${fallbackMessage} Render respondió con un formato inesperado.`);
    }

    return result;
}

function currentUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null')?.id || null;
}

async function saveRemoteData(resource, data) {
    const userId = currentUserId();
    if (!userId) throw new Error('Inicia sesión para guardar tus datos.');
    const response = await fetch(`${DATA_API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId })
    });
    return readApiResponse(response, 'No se pudieron guardar los datos.');
}

async function loadRemoteData(resource) {
    const userId = currentUserId();
    if (!userId) return [];
    const response = await fetch(`${DATA_API_BASE_URL}/${resource}/${userId}`);
    return readApiResponse(response, 'No se pudieron cargar los datos.');
}

async function deleteRemoteData(resource, id) {
    const userId = currentUserId();
    if (!userId) return;
    const response = await fetch(`${DATA_API_BASE_URL}/${resource}/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
    });
    return readApiResponse(response, 'No se pudo eliminar el registro.');
}
