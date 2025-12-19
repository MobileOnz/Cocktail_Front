
//테이블 생성
export const createTableSql = (def: string) =>
    `CREATE TABLE IF NOT EXISTS ${def.trim()};`;


// 디비 인덱싱
export const INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_keywords_name ON keywords(name);', //검색 최적화를 위해 name기준으로 인덱싱 넣기
] as const;
