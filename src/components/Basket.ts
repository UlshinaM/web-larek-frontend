import { createElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IBasketView {
    cards: HTMLLIElement[];
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
        } else {
            this.container.replaceChild(this._list, createElement('p', {textContent: 'В корзине пока нет товаров'}));
            this._buttonOrder.disabled = true; //проверить, становится ли доступным при добавлении товаров в корзину
        }
    };

    set total(totalPrice: number) {
        //оформить в специальную функцию, ее результатом будет строка с разбитыми цифрами
        //преобразовать в отображении карточки и в оповещении об успешном заказе
        const tensThousands = Math.floor(totalPrice / 10000);
        if (tensThousands) {
            this._total.textContent = `${String(Math.floor(totalPrice / 1000))} ${String(totalPrice % 1000)} синапсов`;
        } else {
            this._total.textContent = `${String(totalPrice)} синапсов`;
        }
    }
}