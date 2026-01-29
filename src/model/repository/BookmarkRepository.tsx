import { BookMarksDataSource } from '../DataSource/BookMarksDataSource';
import { CocktailCard } from '../domain/CocktailCard';
import { CocktailSchema } from '../Schema/CocktailSchema';

export interface IBookmarkRepository {
    fetchBookmarked(): Promise<CocktailCard[]>;
}
export class BookmarkRepository implements IBookmarkRepository {
    private dataSource: BookMarksDataSource;

    constructor(dataSource?: BookMarksDataSource) {
        this.dataSource = dataSource ?? new BookMarksDataSource();
    }
    async fetchBookmarked(): Promise<CocktailCard[]> {
        const dto = await this.dataSource.fetchBookMarks();
        const validSchema = dto.map((item) => {
            return CocktailSchema.parse(item);
        });
        return validSchema.map(dto => ({
            id: dto.id,
            name: dto.korName,
            type: dto.style,
            image: dto.imageUrl,
            isBookmarked: dto.isBookmarked,
        }));
    }

}
