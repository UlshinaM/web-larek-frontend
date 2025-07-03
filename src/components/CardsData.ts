import { ICard, ICardsCatalog } from "../types";
import { IEvents } from "./base/events";

export class CardsData implements ICardsCatalog { //все методы на "удобных" данных работают
    protected _cards: ICard[];
    protected _selectedCard: string | null = '';
    protected events: IEvents;

    constructor (events: IEvents) {
        this.events = events;
    }

    // Сохранить и выдать массив карточек товаров
    set cards(cards: ICard[]) {
        this._cards = cards;
        //this.events.emit('cards:change'); //может понадобиться, если список товаров будет обновляться
    }

    get cards() {
        return this._cards;
    }

    //Сохранить Id кликнутой карточки и сообщить, что она была выбрана
    set selectedCard(cardId: string) {
        this._selectedCard = cardId;
        //this.events.emit('card:select');
    }
    //получить id выбранной карточки для последующей обработки, например, для открытия карточки в модальном окне или добавлении товара в корзину
    get selectedCard() {
        //могут ли быть такие случаи, когда id карточки может быть запрошен до ее выбора???
        return this._selectedCard;
    }

    //получить конкретную карточку из массива по ее id
    getCard(cardId: string): ICard {
        const card = this._cards.find(card => card.id === cardId);
        return card;
    }

    //получить общую стоимость корзины выбранных товаров
    getTotalPrice(products: string[]): number {
        let totalPrice: number = 0;
        products.forEach((cardId) => {
            if (this.getCard(cardId).price) {
                totalPrice += this.getCard(cardId).price;
            }
        });
        return totalPrice;
    }
}