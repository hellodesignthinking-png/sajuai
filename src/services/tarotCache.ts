/**
 * IndexedDB-based cache for tarot card images.
 * Stores base64 images keyed by user analysis hash to avoid re-generation.
 */

const DB_NAME = 'fate-sync-cache';
const STORE_NAME = 'tarot-images';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function saveTarotImage(key: string, base64: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ image: base64, timestamp: Date.now() }, key);
        await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('TarotCache: save failed', e);
    }
}

export async function getTarotImage(key: string): Promise<string | null> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        return new Promise((resolve, reject) => {
            req.onsuccess = () => {
                const result = req.result;
                if (result && result.image) {
                    resolve(result.image);
                } else {
                    resolve(null);
                }
            };
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn('TarotCache: get failed', e);
        return null;
    }
}

export async function clearTarotCache(): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
    } catch (e) {
        console.warn('TarotCache: clear failed', e);
    }
}
