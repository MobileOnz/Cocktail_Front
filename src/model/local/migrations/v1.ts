import type SQLite from 'react-native-sqlite-storage';
import { createTableSql, INDEXES } from '../schema/modules';
import { SCHEMA } from '../schema/keywords';

console.log('[MIG v1] SCHEMA:', SCHEMA);
export async function migrateV1(db: SQLite.SQLiteDatabase) {
    try {
        await db.executeSql(createTableSql(SCHEMA.keywords));

        // ✅ keywords 테이블 생성됐는지 바로 확인
        const [t1] = await db.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        );
        console.log('[MIG v1 tables after create]', t1.rows.raw());

        for (const sql of INDEXES) {
            console.log('[MIG v1 index sql]', sql);
            await db.executeSql(sql);
        }

        // ✅ 인덱스까지 다 돈 뒤에도 확인
        const [t2] = await db.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        );
        console.log('[MIG v1 tables after indexes]', t2.rows.raw());
    } catch (e) {
        console.log('[MIG v1 ERROR]', e);
        throw e;
    }
}

