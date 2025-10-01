import { openDB } from 'idb';

const DB_NAME = 'story-app';
const STORE_NAME = 'favorites';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function addToFavorites(story) {
  const db = await getDB();
  await db.put(STORE_NAME, story); // id unik
}

export async function getFavorites() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function removeFavorite(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
