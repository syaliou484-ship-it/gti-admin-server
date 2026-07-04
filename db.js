// db.js
// Petite base de données fichier (JSON) — aucune dépendance native.
// Suffisant pour un espace admin GTI. Peut être remplacée plus tard par
// une vraie base (Postgres/MySQL) sans changer les routes, juste ce fichier.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readAll(collection) {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    const raw = fs.readFileSync(fp, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Erreur lecture ${collection}.json`, e);
    return [];
  }
}

function writeAll(collection, items) {
  fs.writeFileSync(filePath(collection), JSON.stringify(items, null, 2), 'utf-8');
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

const db = {
  find(collection, predicate = () => true) {
    return readAll(collection).filter(predicate);
  },
  findOne(collection, predicate) {
    return readAll(collection).find(predicate) || null;
  },
  getById(collection, id) {
    return readAll(collection).find((i) => i.id === Number(id)) || null;
  },
  insert(collection, data) {
    const items = readAll(collection);
    const item = { id: nextId(items), createdAt: new Date().toISOString(), ...data };
    items.push(item);
    writeAll(collection, items);
    return item;
  },
  update(collection, id, patch) {
    const items = readAll(collection);
    const idx = items.findIndex((i) => i.id === Number(id));
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(collection, items);
    return items[idx];
  },
  remove(collection, id) {
    const items = readAll(collection);
    const idx = items.findIndex((i) => i.id === Number(id));
    if (idx === -1) return false;
    items.splice(idx, 1);
    writeAll(collection, items);
    return true;
  },
  all(collection) {
    return readAll(collection);
  },
};

module.exports = db;
