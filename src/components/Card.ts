import { cloneTemplate, ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card {
    protected container: HTMLElement;
    protected template: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _category?: HTMLSpanElement;
    protected _description?: HTMLParagraphElement;
    protected _button?: HTMLButtonElement;
    protected _basketItem?: HTMLSpanElement;
    protected events: IEvents;

    constructor(template: HTMLTemplateElement, events: IEvents, actions?: ICardActions) {
        this.events = events;
        this.container = cloneTemplate(template); //в этом элементе будет либо gallery__item, либо card_full, либо card_compact

        //в зависимости от места отображения заголовок - это разные теги
        this._title = ensureElement<HTMLElement>('.card__title', this.container);
        this._price = ensureElement<HTMLSpanElement>('.card__price', this.container);
        //другие элементы разметки могут опционально присутствовать в карточке
        this._image = this.container.querySelector('.card__image');
        this._category = this.container.querySelector('.card__category');
        this._description = this.container.querySelector('.card__text');
        this._button = this.container.querySelector('.card__button');
        this._basketItem = this.container.querySelector('.basket__item-index');

        if (actions?.onClick) {
            if (this._button) { //если в разметке карточки есть кнопка, то будем слушать клик по ней
                this._button.addEventListener('click', actions.onClick);
                //еще как вариант ('click', () => this.events.emit('card_button:click', {card: this}))
            } else { //если в разметке карточки нет кнопки, то слушаем клик по всей карточке
                this.container.addEventListener('click', actions.onClick);
                //еще как вариант ('click', () => this.events.emit('card:select', {card: this}))
            }
        }
    }

    set title(value: string) {
        this._title.textContent = value;
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: number | null) {
        if (value) {
            this._price.textContent = `${String(value)} синапсов`;
        } else {
            this._price.textContent = 'Бесценно';
        }
    }

    /*get price(): string {
        return this._price.textContent || '';
    }*/
    set image(value: string) {
        if (this._image) {
            this._image.src = value;
            this._image.alt = this.title;
        }
    }

    set category(value: string) {
        if (this._category) {
            this._category.textContent = value;
        }
    }

    set description(value: string) {
        if (this._description) {
            this._description.textContent = value;
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set basketItem(value: number) {
        if (this._basketItem) {
            this._basketItem.textContent = String(value);
        }
    }

    //метод понадобиться, чтобы изменить надпись на кнопке развернутой карточки. Кнопка может получить надпись 'Удалить', 'В корзину' и 'Товар бесценен' в этом случае кнопка должна становиться неактивной
    setCardButtonText(textContent: string):void {
        if (this._button && !this._button.classList.contains('basket__item-delete')) {
            this._button.textContent = textContent;
        }
    }

    getCardButtonText():string {
        if (this._button && !this._button.classList.contains('basket__item-delete')) {
            return this._button.textContent;
        }
    }

    //заблокировать кнопку покупки для Бесценных товаров
    disableCardButton():void {
        if (this._button && !this._button.classList.contains('basket__item-delete')) {
            this._button.disabled;
        }
    }

    render() {
        return this.container;
    }
}