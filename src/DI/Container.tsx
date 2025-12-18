import { CocktailDetailRepository, ICocktailDetailRepository } from '../model/repository/CocktailDetailRepository';
import { HomeCocktailRepository, IHomeCocktailRepository } from '../model/repository/HomeCocktailRepository';
import { ISearchRepository, SearchRepository } from '../model/repository/SearchRepository';


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
