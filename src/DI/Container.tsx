import { CocktailDetailRepository, ICocktailDetailRepository } from "../model/repository/CocktailDetailRepository";
import { HomeCocktailRepository, IHomeCocktailRepository } from "../model/repository/HomeCocktailRepository";
import { CocktailSearchRepository, ICocktailSearchRepository } from "../model/repository/SearchRepository";

class DIContainer {
    readonly cocktailSearchRepository: ICocktailSearchRepository;
    readonly homeCocktailRepository: IHomeCocktailRepository;
    readonly cocktailDetailRepository: ICocktailDetailRepository;
    constructor() {
        this.cocktailSearchRepository = new CocktailSearchRepository;
        this.homeCocktailRepository = new HomeCocktailRepository;
        this.cocktailDetailRepository = new CocktailDetailRepository
    }

}

export const di = new DIContainer();