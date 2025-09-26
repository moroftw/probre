import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('probreedics.db');
  return _db;
}

export async function addBornDateColumnIfMissing() {
  const db = await getDb();
  try {
    await db.runAsync(`ALTER TABLE matings ADD COLUMN bornDate TEXT`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column')) {
      console.warn('Could not add bornDate column:', e.message);
    }
  }
}

export async function addPuppyBirthdateColumnIfMissing() {
  const db = await getDb();
  try {
    await db.runAsync(`ALTER TABLE puppies ADD COLUMN birthdate TEXT`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column')) {
      console.warn('Could not add birthdate column:', e.message);
    }
  }
}

export async function addPuppyFullNameColumnIfMissing() {
  const db = await getDb();
  try {
    await db.runAsync(`ALTER TABLE puppies ADD COLUMN fullName TEXT`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column')) {
      console.warn('Could not add fullName column:', e.message);
    }
  }
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS dogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      sex TEXT,
      breed TEXT,
      birthdate TEXT,
      color TEXT,
      microchip TEXT,
      notes TEXT,
      imageUri TEXT
    );

    CREATE TABLE IF NOT EXISTS matings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maleDogId INTEGER,
      femaleDogId INTEGER,
      date TEXT,
      bornDate TEXT,
      FOREIGN KEY (maleDogId) REFERENCES dogs(id) ON DELETE CASCADE,
      FOREIGN KEY (femaleDogId) REFERENCES dogs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS puppies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      fullName TEXT,
      sex TEXT,
      image TEXT,
      birthdate TEXT,
      matingId INTEGER,
      FOREIGN KEY (matingId) REFERENCES matings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS puppy_weights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puppyId INTEGER,
      dateTime TEXT,
      weightKg REAL,
      weightGrams INTEGER,
      FOREIGN KEY (puppyId) REFERENCES puppies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS genetic_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dogId INTEGER,
      testName TEXT,
      result TEXT,
      lab TEXT,
      date TEXT,
      notes TEXT,
      FOREIGN KEY (dogId) REFERENCES dogs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vet_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dogId INTEGER,
      type TEXT,
      title TEXT,
      date TEXT,
      nextDueDate TEXT,
      notes TEXT,
      FOREIGN KEY (dogId) REFERENCES dogs(id) ON DELETE CASCADE
    );

    /* 👇 NOU: Deworming per puppy */
    CREATE TABLE IF NOT EXISTS puppy_deworming (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puppyId INTEGER NOT NULL,
      date TEXT NOT NULL,
      medicine TEXT DEFAULT '',
      FOREIGN KEY (puppyId) REFERENCES puppies(id) ON DELETE CASCADE
    );
  `);

  await addBornDateColumnIfMissing();
  await addPuppyBirthdateColumnIfMissing();
  await addPuppyFullNameColumnIfMissing();
}

// Puppy Weights Logic
export async function insertPuppyWeight(data: {
  puppyId: number;
  dateTime: string;
  weightKg: number;
  weightGrams?: number;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO puppy_weights (puppyId, dateTime, weightKg, weightGrams)
     VALUES (?, ?, ?, ?)`,
    [data.puppyId, data.dateTime, data.weightKg, data.weightGrams ?? 0]
  );
}

export async function getPuppyWeights(puppyId: number) {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT * FROM puppy_weights WHERE puppyId=? ORDER BY dateTime ASC`,
    [puppyId]
  );
}

export async function updatePuppyWeight(id: number, data: {
  dateTime: string;
  weightKg: number;
  weightGrams?: number;
}) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE puppy_weights SET dateTime=?, weightKg=?, weightGrams=? WHERE id=?`,
    [data.dateTime, data.weightKg, data.weightGrams ?? 0, id]
  );
}

export async function deletePuppyWeight(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM puppy_weights WHERE id=?', [id]);
}

// Existing logic

export async function getDogs() {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM dogs ORDER BY id');
}

export async function getDogById(id: number) {
  const db = await getDb();
  return await db.getFirstAsync('SELECT * FROM dogs WHERE id=?', [id]);
}

export async function insertDog(d: any) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO dogs (name, sex, breed, birthdate, color, microchip, notes, imageUri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.name, d.sex, d.breed, d.birthdate, d.color, d.microchip, d.notes, d.imageUri]
  );
}

export async function updateDog(id: number, d: any) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE dogs SET name=?, sex=?, breed=?, birthdate=?, color=?, microchip=?, notes=?, imageUri=? WHERE id=?`,
    [d.name, d.sex, d.breed, d.birthdate, d.color, d.microchip, d.notes, d.imageUri, id]
  );
}

export async function deleteDog(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM dogs WHERE id=?', [id]);
}

export async function getMatings() {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM matings ORDER BY date DESC, id DESC');
}

export async function getMatingById(id: number) {
  const db = await getDb();
  return await db.getFirstAsync(
    `SELECT m.*, d1.name AS male_name, d2.name AS female_name
     FROM matings m
     JOIN dogs d1 ON m.maleDogId = d1.id
     JOIN dogs d2 ON m.femaleDogId = d2.id
     WHERE m.id = ?`,
    [id]
  );
}

export async function insertMating(m: { maleDogId: number; femaleDogId: number; date: string }) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO matings (maleDogId, femaleDogId, date) VALUES (?, ?, ?)',
    [m.maleDogId, m.femaleDogId, m.date]
  );
}

export async function updateMating(id: number, m: { maleDogId: number; femaleDogId: number; date: string }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE matings SET maleDogId=?, femaleDogId=?, date=? WHERE id=?',
    [m.maleDogId, m.femaleDogId, m.date, id]
  );
}

export async function updateMatingDates(id: number, date: string, bornDate: string) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE matings SET date=?, bornDate=? WHERE id=?`,
    [date, bornDate, id]
  );
}

export async function deleteMating(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM matings WHERE id=?', [id]);
}

export async function insertPuppy(p: {
  name: string;
  fullName?: string;
  sex: 'M' | 'F';
  image: string;
  birthdate?: string;
  matingId: number;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO puppies (name, fullName, sex, image, birthdate, matingId) VALUES (?, ?, ?, ?, ?, ?)`,
    [p.name, p.fullName ?? null, p.sex, p.image, p.birthdate, p.matingId]
  );
}

export async function updatePuppy(id: number, p: {
  name: string;
  fullName?: string;
  sex: 'M' | 'F';
  image: string;
  birthdate?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE puppies SET name=?, fullName=?, sex=?, image=?, birthdate=? WHERE id=?`,
    [p.name, p.fullName ?? null, p.sex, p.image, p.birthdate, id]
  );
}

export async function getPuppiesByMatingId(matingId: number) {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM puppies WHERE matingId=? ORDER BY id DESC', [matingId]);
}

export async function getPuppyById(id: number) {
  const db = await getDb();
  return await db.getFirstAsync('SELECT * FROM puppies WHERE id=?', [id]);
}

export async function insertGeneticTest(t: {
  dogId: number;
  testName: string;
  result?: string;
  lab?: string;
  date?: string;
  notes?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO genetic_tests (dogId, testName, result, lab, date, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [t.dogId, t.testName, t.result, t.lab, t.date, t.notes]
  );
}

export async function getGeneticTests(dogId: number) {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM genetic_tests WHERE dogId=? ORDER BY date DESC, id DESC', [dogId]);
}

export async function deleteGeneticTest(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM genetic_tests WHERE id=?', [id]);
}

export async function insertVetRecord(r: {
  dogId: number;
  type: string;
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
}) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO vet_records (dogId, type, title, date, nextDueDate, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [r.dogId, r.type, r.title, r.date, r.nextDueDate, r.notes]
  );
}

export async function getVetRecords(dogId: number) {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM vet_records WHERE dogId=? ORDER BY date DESC, id DESC', [dogId]);
}

export async function deleteVetRecord(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM vet_records WHERE id=?', [id]);
}

/* ====== NOU: Deworming API ====== */

export type DewormingRow = {
  id: number;
  puppyId: number;
  date: string;      // 'YYYY-MM-DD'
  medicine: string | null;
};

export async function getDewormingsByPuppyId(puppyId: number): Promise<DewormingRow[]> {
  const db = await getDb();
  return await db.getAllAsync(
    'SELECT id, puppyId, date, medicine FROM puppy_deworming WHERE puppyId = ? ORDER BY id ASC',
    [puppyId]
  );
}

export async function insertDeworming(puppyId: number, date: string, medicine: string) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO puppy_deworming (puppyId, date, medicine) VALUES (?, ?, ?)',
    [puppyId, date, medicine]
  );
}

export async function updateDeworming(id: number, patch: { date?: string; medicine?: string }) {
  const db = await getDb();
  const fields: string[] = [];
  const params: any[] = [];
  if (patch.date !== undefined) { fields.push('date = ?'); params.push(patch.date); }
  if (patch.medicine !== undefined) { fields.push('medicine = ?'); params.push(patch.medicine); }
  if (!fields.length) return;
  params.push(id);
  await db.runAsync(
    `UPDATE puppy_deworming SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
}


// Delete a single deworming entry by id
export async function deleteDeworming(id: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM puppy_deworming WHERE id = ?', [id]);
}


// Delete all deworming entries for a given puppy
export async function deleteDewormingsByPuppyId(puppyId: number) {
  const db = await getDb();
  await db.runAsync('DELETE FROM puppy_deworming WHERE puppyId = ?', [puppyId]);
}
