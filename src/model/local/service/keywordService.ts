import { KeywordDatasource } from '../../DataSource/KeywordDatasource';
import { Keyword } from '../../dto/KeywordDto';
import { replaceAllKeywords } from '../../repository/KeywordRepository';


const datasource = new KeywordDatasource();

export async function syncKeywordData() {

    const keywords: Keyword[] = await datasource.fetchKeyword();

    await replaceAllKeywords(keywords);

    return keywords;
}
