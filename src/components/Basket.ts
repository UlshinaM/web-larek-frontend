import { createElement, stringifyPrice } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IBasketView {
    cards: HTMLElement[];
    total: number;
}

export class Basket extends ViewComponent<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _buttonOrder: HTMLButtonElement;
    protected events: IEvents;

    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this._list = container.querySelector('.basket__list');
        this._total = container.querySelector('.basket__price');
        this._buttonOrder = container.querySelector('.basket__button');

        this._buttonOrder.addEventListener('click', () => {
            this.events.emit('basket:placed');
        });
        
        this.cards = [];
    };

    set cards(basketProducts: HTMLLIElement[]) {
        if (basketProducts.length) {
            this._list.replaceChildren(...basketProducts);
            this._buttonOrder.disabled = false;
        } else {
            this._list.replaceChildren(createElement('p', {textContent: 'В корзине пока нет товаров'}));
            this._buttonOrder.disabled = true; //проверить, становится ли доступным при добавлении товаров в корзину
        }
    };

    set total(totalPrice: number) {
        this._total.textContent = `${stringifyPrice(totalPrice)}`;
    }
}