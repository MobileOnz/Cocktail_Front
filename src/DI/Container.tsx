import { CocktailDetailRepository, ICocktailDetailRepository } from '../model/Repository/CocktailDetailRepository';
import { HomeCocktailRepository, IHomeCocktailRepository } from '../model/Repository/HomeCocktailRepository';
import { ISearchRepository, SearchRepository } from '../model/Repository/SearchRepository';


class DIContainer {
    readonly cocktailSearchRepository: ISearchRepository;
    readonly homeCocktailRepository: IHomeCocktailRepository;
    readonly cocktailDetailRepository: ICocktailDetailRepository;
    constructor() {
        this.cocktailSearchRepository = new SearchRepository();
        this.homeCocktailRepository = new HomeCocktailRepository();
        this.cocktailDetailRepository = new CocktailDetailRepository();
    }

}

export const di = new DIContainer();
