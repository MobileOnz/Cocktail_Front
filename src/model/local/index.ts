import SQLite from 'react-native-sqlite-storage';
import { runMigrations } from './migrations';


SQLite.enablePromise(true);

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
    if (_db) { return _db; }

    _db = await SQLite.openDatabase({ name: 'app.db', location: 'default' });

    await _db.executeSql('PRAGMA journal_mode=WAL;');
    await _db.executeSql('PRAGMA foreign_keys=ON;');

    return _db;
}

export async function initDb() {
    const db = await getDb();
    await runMigrations(db);
    return db;
}
