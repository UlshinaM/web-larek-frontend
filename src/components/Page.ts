import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IPage {
    counter: number; //поле для счетчика товаров в корзине
    gallery: HTMLElement[]; //поле для хранения массива карточек товаров, выводящихся на главной странице
    locked: boolean; //поле, хранящее указатель, разрешено или запрещено взаимодействие со страницей
}

export class Page extends ViewComponent<IPage> {
    protected _gallery: HTMLElement;
    protected _basketButton: HTMLButtonElement;
    protected _counter: HTMLSpanElement; 
    protected _wrapper: HTMLElement;
    protected events: IEvents;

    constructor(protected container: HTMLBodyElement, events: IEvents) {
        super(container);

        this.events = events;
        this._gallery = container.querySelector('.gallery');
        this._basketButton = container.querySelector('.header__basket');
        this._counter = container.querySelector('.header__basket-counter');
        this._wrapper = container.querySelector('.page__wrapper');

        this._basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(productsNumber: number) {
        this._counter.textContent = String(productsNumber);
    }

    set gallery(cards: HTMLElement[]) {
        this._gallery.replaceChildren(...cards);
    }

    set locked(value: boolean) {
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }

    //render наследуется от родителя, метод модифицировать не надо
}