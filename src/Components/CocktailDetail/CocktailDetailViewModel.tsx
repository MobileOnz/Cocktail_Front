import { CocktailRepository } from '../../model/Repository/CocktailDetailRepository';

export class CocktailDetailViewModel {
    constructor(private repository: CocktailRepository) { }

    async load(id: number) {
        return await this.repository.getDetail(id);
    }
}
