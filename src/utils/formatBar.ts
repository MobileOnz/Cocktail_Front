// utils/formatBar.ts

export const formatBarForMyList = (bar: any) => ({
    id: bar.id,
    title: bar.bar_name,
    barAdress: bar.address,
    thumbNail: { uri: bar.thumbnail },
    hashtagList: bar.menus?.map((menu) => `#${menu.name}`) ?? [],
  });
  