import { BookmarkRepository, IBookmarkRepository } from '../model/repository/BookmarkRepository';
import { CocktailDetailRepository, ICocktailDetailRepository } from '../model/repository/CocktailDetailRepository';
import { HomeCocktailRepository, IHomeCocktailRepository } from '../model/repository/HomeCocktailRepository';
import { IMonitoringRepository } from '../model/repository/MonitoringRepository';
import { ISearchRepository, SearchRepository } from '../model/repository/SearchRepository';


class DIContainer {
    readonly cocktailSearchRepository: ISearchRepository;
    readonly homeCocktailRepository: IHomeCocktailRepository;
    readonly cocktailDetailRepository: ICocktailDetailRepository;
    readonly bookmarkRepository: IBookmarkRepository;
    readonly monitoringRepository: IMonitoringRepository;
    constructor() {
        this.monitoringRepository = new M
        this.cocktailSearchRepository = new SearchRepository();
        this.homeCocktailRepository = new HomeCocktailRepository();
        this.cocktailDetailRepository = new CocktailDetailRepository();
        this.bookmarkRepository = new BookmarkRepository();
    }

}

export const di = new DIContainer();
