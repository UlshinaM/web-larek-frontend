import { stringifyPrice } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IOrderSuccess {
    total: number;
}

export class OrderSuccess extends ViewComponent<IOrderSuccess> {
    protected _closeSuccessButton: HTMLButtonElement;
    protected _orderPayTotal: HTMLParagraphElement;
    protected events: IEvents;

    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);

        this.events = events;

        this._closeSuccessButton = container.querySelector('.order-success__close');
        this._orderPayTotal = container.querySelector('.order-success__description');

        this._closeSuccessButton.addEventListener('click', () => {
            this.events.emit('orderSuccess:close'); //чтобы очистить корзину и вызвать метод закрытия модального окна
        });
    }

    set total(totalPrice: number) {
        this._orderPayTotal.textContent = `${stringifyPrice(totalPrice)}`;
    }
}