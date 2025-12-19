import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { migrateV1 } from './v1';

type Migration = { version: number; up: (db: SQLiteDatabase) => Promise<void> };

const migrations: Migration[] = [{ version: 1, up: migrateV1 }]; // 버전 관리. 추가시 2, migrateV2와 같이 작성하기


//버전 전체 관리하는 함수
export async function runMigrations(db: SQLiteDatabase) {
    const [res] = await db.executeSql('PRAGMA user_version;');
    let current = res.rows.item(0).user_version as number;
    console.log('[MIG] user_version:', current);

    const pending = migrations.filter(m => m.version > current).sort((a, b) => a.version - b.version);
    console.log('[MIG] pending:', pending.map(p => p.version));

    for (const m of pending) {
        await db.transaction(async () => {
            console.log('[MIG] applying:', m.version);
            await m.up(db);
            await db.executeSql(`PRAGMA user_version = ${m.version};`);
        });
        current = m.version;
    }
}
