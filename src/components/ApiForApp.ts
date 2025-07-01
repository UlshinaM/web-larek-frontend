import { ApiListResponse, IApi, ICard, IOrderResult, IUser } from "../types";

export class ApiForApp { //все методы запросов на корректных данных работают, ссылки на картину тоже полные
    private _methodsApi: IApi;
    readonly cdn: string;
    //в поле _methodsApi будет храниться строка базового URL для дописания пути к серверу и методы запросов на сервер, которые не придется прописывать здесь
    constructor (methodsApi: IApi, cdn: string) {
        this._methodsApi = methodsApi;
        this.cdn = cdn; //для получения полной ссылки на изображение в карточках товара
    }

    //методы для отправки всех необходимых запросов к серверу
    //получить список товаров с сервера
    getCards(): Promise<ICard[]> {
        return this._methodsApi.get<ApiListResponse<ICard>>(`/product`).then((cardsData: ApiListResponse<ICard>) => 
            cardsData.items.map((card: ICard) => ({
                ...card, //все о карточке
                image: this.cdn + card.image //точная ссылка на изображение
            }))
        );
    }

    //получить 1 карточку по ее id
    getTheCard(id: string): Promise<ICard> {
        return this._methodsApi.get<ICard>(`/product/${id}`).then((card: ICard) => ({
                ...card,
                image: this.cdn + card.image,
            })
        );
    }

    //отправить объект с информацией о пользователе и купленных им товарах на сервер
    postOrderUserData(data: IUser): Promise<IOrderResult> {
        return this._methodsApi.post<IOrderResult>(`/order`, data).then((resultData: IOrderResult) => resultData);
    }
}