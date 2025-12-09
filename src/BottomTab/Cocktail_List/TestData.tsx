import { CocktailDetailDto } from "../../model/dto/CocktailDetailDto";

export const cocktailDetailTestData: CocktailDetailDto[] = [
    {
        id: 1,
        title: '마가리타',
        image: 'https://picsum.photos/400/400',
        tone: 'light',
        season: '여름',

        summary:
            '라임의 상큼함과 테킬라의 조화를 느낄 수 있는 대표적인 클래식 사워 칵테일.',
        story:
            '1930년대 멕시코에서 시작된 것으로 알려진 마가리타는 상큼한 맛과 접근성으로 전 세계적으로 사랑받고 있습니다.',
        mood: '식전, 오후의 휴식, 가벼운, 클래식',
        abv: '18%',
        base: 'Tequila',
        category: 'Sour',
        taste: 'Sour, Fresh',
        body: 'Light',

        ingredients: [
            { name: '테킬라', amount: '45ml' },
            { name: '라임 주스', amount: '30ml' },
            { name: '트리플 섹', amount: '15ml' },
        ],
        garnish: ['라임 슬라이스', '솔트 리밍'],
    },

    {
        id: 2,
        title: '올드 패션드',
        image: 'https://picsum.photos/400/400',
        tone: 'standard',
        season: '여름',
        summary: '위스키의 깊고 진한 풍미를 정석적으로 즐길 수 있는 클래식 칵테일.',
        story:
            '1800년대부터 전해 내려온 가장 오래된 칵테일 중 하나로, 단순하지만 풍부한 맛이 특징입니다.',
        mood: '식전, 오후의 휴식, 가벼운, 클래식',
        abv: '32%',
        base: 'Whiskey',
        category: 'Spirit-forward',
        taste: 'Bitter, Sweet',
        body: 'Medium',

        ingredients: [
            { name: '버번 위스키', amount: '45ml' },
            { name: '비터스', amount: '2 dashes' },
            { name: '설탕 큐브', amount: '1개' },
        ],
        garnish: ['오렌지 필'],
    },

    {
        id: 3,
        title: '모히토',
        image: 'https://picsum.photos/400/400',
        tone: 'special',
        season: '여름',
        summary:
            '라임과 민트의 조합으로 상큼함과 청량감을 극대화한 가장 인기 있는 하이볼 칵테일.',
        story:
            '쿠바의 전통 음료에서 발전된 칵테일로, 여름철 대표 시그니처 음료로 자리잡았습니다.',
        mood: '식전, 오후의 휴식, 가벼운, 클래식',
        abv: '12%',
        base: 'Rum',
        category: 'Highball',
        taste: 'Fresh, Minty',
        body: 'Light',

        ingredients: [
            { name: '화이트 럼', amount: '45ml' },
            { name: '라임', amount: '1/2개' },
            { name: '민트 잎', amount: '10장' },
            { name: '탄산수', amount: '채우기' },
        ],
        garnish: ['민트 가지'],
    },

    {
        id: 4,
        title: '블루 하와이',
        image: 'https://picsum.photos/400/400',
        tone: 'strong',
        season: '여름',
        summary: '푸른색이 돋보이는 달콤하고 부드러운 트로피컬 스타일 칵테일.',
        story:
            '1957년 와이키키에서 바텐더 해리 예가 개발한 칵테일로, 하와이 바다 색감에서 영감을 받았습니다.',
        mood: '식전, 오후의 휴식, 가벼운, 클래식',
        abv: '15%',
        base: 'Rum',
        category: 'Tropical',
        taste: 'Sweet, Fruity',
        body: 'Medium',

        ingredients: [
            { name: '화이트 럼', amount: '30ml' },
            { name: '블루 큐라소', amount: '20ml' },
            { name: '파인애플 주스', amount: '60ml' },
            { name: '코코넛 크림', amount: '15ml' },
        ],
        garnish: ['파인애플 슬라이스', '체리'],
    },

    {
        id: 5,
        title: '맨해튼',
        image: 'https://picsum.photos/400/400',
        tone: 'classic',
        season: '여름',
        summary:
            '버번과 베르무트의 밸런스가 완벽한 깊고 중후한 클래식 칵테일.',
        story:
            '1800년대 뉴욕 맨해튼 클럽에서 시작되었다고 알려져 있으며, 가장 상징적인 위스키 베이스 칵테일입니다.',
        mood: '식전, 오후의 휴식, 가벼운, 클래식',
        abv: '30%',
        base: 'Whiskey',
        category: 'Spirit-forward',
        taste: 'Dry, Bold',
        body: 'Full',

        ingredients: [
            { name: '버번 위스키', amount: '50ml' },
            { name: '스위트 베르무트', amount: '20ml' },
            { name: '비터스', amount: '2 dashes' },
        ],
        garnish: ['체리'],
    },
];
