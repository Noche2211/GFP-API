const BACKUP_STORAGE_KEY = 'gfpBackups';

function getBackupStorageKey() {
    const userId = typeof currentUserId === 'function' ? currentUserId() : null;
    return userId ? `${BACKUP_STORAGE_KEY}_${userId}` : BACKUP_STORAGE_KEY;
}

function getBackups() {
    return JSON.parse(localStorage.getItem(getBackupStorageKey()) || '[]');
}

function saveBackups(backups) {
    localStorage.setItem(getBackupStorageKey(), JSON.stringify(backups));
}

async function loadRemoteBackups() {
    if (typeof loadRemoteData !== 'function' || !currentUserId()) return getBackups();
    const backups = await loadRemoteData('backups');
    saveBackups(backups);
    return backups;
}

async function saveBackup(backup) {
    if (typeof saveRemoteData === 'function' && currentUserId()) {
        await saveRemoteData('backups', backup);
    }
    const backups = getBackups().filter(item => item.id !== backup.id);
    backups.unshift(backup);
    saveBackups(backups);
}
