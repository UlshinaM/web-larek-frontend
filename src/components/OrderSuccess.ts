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
        const tensThousands = Math.floor(totalPrice / 10000);
        if (tensThousands) {
            this._orderPayTotal.textContent = `Списано ${String(Math.floor(totalPrice / 1000))} ${String(totalPrice % 1000)} синапсов`;
        } else {
            this._orderPayTotal.textContent = `Списано ${String(totalPrice)} синапсов`;
        }
    }
}