import { Keyword } from '../dto/KeywordDto';
import { getDb } from '../local';


export async function replaceAllKeywords(items: Keyword[]) {
  const db = await getDb();

  await db.transaction(async () => {
    await db.executeSql('DELETE FROM keywords;');

    for (const it of items) {
      await db.executeSql(
        'INSERT INTO keywords (id, name) VALUES (?, ?);',
        [it.id, it.name]
      );
    }
  });
}


export async function searchKeywords(query: string): Promise<Keyword[]> {
  const q = query.trim();
  if (!q) { return []; }

  const db = await getDb();
  const [res] = await db.executeSql(
    'SELECT id, name FROM keywords WHERE name LIKE ? LIMIT 5;',
    [`%${q}%`]
  );
  return res.rows.raw() as Keyword[];


}
