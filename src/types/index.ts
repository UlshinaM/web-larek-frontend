//Данные о товаре, как их получаем с сервера
//Отдельный объект конкретной карточки можно получить с помощью GET-запроса, передав в качестве uri ее id,
//если карточки с таким id не будет в списке вернется ошибка
export interface ICard {
    id: string;
    title: string;
    price: number | null;
    category: string;
    image: string;
    description: string;
}

export interface ICardsCatalog {
    cards: ICard[];
    selectedCard: string | null;
    getCard(cardId: string): ICard; //для просмотра в попапе, например
}

export type TPayMethod = 'online' | 'cash';
//Данные о пользователе, кототрые пойдут на сервер в POST-запросе
export interface IUser {
    payment: TPayMethod;
    address: string;
    email: string;
    phone: string;
    total: number;
    items: string[];
}

export interface IUserData {
    setUserInfo(userInfo: TUserPayAddress | TUserContact | TUserBasket): void;
    getUserBasket(): TUserBasket;
    checkUserValidation(data: TUserBasket | TUserPayAddress | TUserContact): boolean;
}

//В ответ на POST-запрос с сервера будет приходить объект с информацией о заказе
export interface IOrderResult {
    id: string; //id заказа
    total: number; //общая стоимость заказа
}

//Данные, которые понадобятся частично

//Данные о товаре для отображения в корзине
export type TCardBasket = Pick<ICard, 'id' | 'title' | 'price'>;

//Данные о пользователе, получаемые с формы "Способ оплаты / адрес"
export type TUserPayAddress = Pick<IUser, 'payment' | 'address'>;

//Данные о пользователе, получаемые с формы "Почта / телефон"
export type TUserContact = Pick<IUser, 'email' | 'phone'>;

export type TUserBasket = Pick<IUser, 'items' | 'total'>;

//Данные, которые понадобятся при работе с корзиной (открытие корзины или количество товаров в иконке на главной странице)
export interface IBasket { //учесть возвможность пустой корзины
    products: TCardBasket[];
    addProductToBasket(productId: string): void;
    deleteProductFromBasket(productId: string): void;
}

//Объект для хранения сообщений об ошибках по полям заказа
export type FormErrors = Partial<Record<keyof IUser, string>>;