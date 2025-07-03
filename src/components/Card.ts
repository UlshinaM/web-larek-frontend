import { ICard } from "../types";
import { cloneTemplate, ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
//let isListenerAdd: boolean = false; //используется, чтобы поставить слушателя клика на кнопку в корзину в модалке только 1 раз и он не ставился при создании всего

export class Card extends ViewComponent<ICard> {
    //protected container: HTMLElement;
    //protected template: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _category?: HTMLSpanElement;
    protected _description?: HTMLParagraphElement;
    protected _buttonModal?: HTMLButtonElement;
    protected _buttonBasket?: HTMLButtonElement;
    protected _basketItem?: HTMLSpanElement;
    protected events: IEvents;
    protected cardId: string;

    //При создании экземпляра карточки необходимо передавать клон темплейта сразу
    constructor(protected container: HTMLElement, events: IEvents, actions?: ICardActions) {
        super(container);
        
        this.events = events;
        
        //this.container = cloneTemplate(template); //в этом элементе будет либо gallery__item, либо card_full, либо card_compact было до ViewComponent

        //в зависимости от места отображения заголовок - это разные теги
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLSpanElement>('.card__price', container);
        //другие элементы разметки могут опционально присутствовать в карточке
        this._image = container.querySelector('.card__image');
        this._category = container.querySelector('.card__category');
        this._description = container.querySelector('.card__text');
        this._buttonModal = container.querySelector('.card__row .card__button');
        this._buttonBasket = container.querySelector('.basket__item-delete');
        this._basketItem = container.querySelector('.basket__item-index');

        //if (actions?.onClick) {
            if (this._buttonModal) { //если в разметке карточки есть кнопка, то будем слушать клик по ней
                //this._button.addEventListener('click', actions.onClick);
                //if (!isListenerAdd) {
                    this._buttonModal.addEventListener('click', () => this.events.emit('cardButtonModal:click', {card: this}));
                    //isListenerAdd = true;
                //}
                } else if(this._buttonBasket) { //чтобы слушатель клика не навешивался на кнопку дважды при создании экзмепляра карточки в попае и экземпляра в корзине
                this._buttonBasket.addEventListener('click', () => this.events.emit('cardButtonDelete:click', {card: this}));
            } else { //если в разметке карточки нет кнопки, то слушаем клик по всей карточке
                //container.addEventListener('click', actions.onClick);
                container.addEventListener('click', () => this.events.emit('cardItem:select', {cardId: this.id}))
            }
        //}
    }

    set title(titleValue: string) {
        this._title.textContent = titleValue;
        if (this._image) {
            this._image.alt = titleValue;
        }
    }

    /*get title(): string {
        return this._title.textContent || '';
    }*/

    set price(priceValue: number | null) {
        if (priceValue) {
            const tensThousands = Math.floor(priceValue / 10000);
            if (tensThousands) {
                this._price.textContent = `${String(tensThousands * 10)} 000 синапсов`;
            } else {
                this._price.textContent = `${String(priceValue)} синапсов`;
            }
            //if (this._button) {
            //    this.disableCardButton(false);
            //}
        } else {
            this._price.textContent = 'Бесценно';
            //if (this._button) {
                //this.setCardButtonText('Не продается');
                //this.disableCardButton.bind(this);
                //this.disableCardButton(true);
            //}
        }
    }

    /*get price(): string {
        return this._price.textContent || '';
    }*/
    set image(linkValue: string) {
        if (this._image) {
            this._image.src = linkValue;
            //this._image.alt = this.title; значение атрибута ставится раньше, чем меняется заголовок карточки, из-за этого описание неверное
        }
    }

    set category(categoryValue: string) {
        if (this._category) {
            this._category.textContent = categoryValue;
            switch (categoryValue) {
                case 'софт-скил': this._category.style.backgroundColor = '#83FA9D';
                    break;
                case 'другое': this._category.style.backgroundColor = '#FAD883';
                    break;
                case 'дополнительное': this._category.style.backgroundColor = '#B783FA';
                    break;
                case 'кнопка': this._category.style.backgroundColor = '#83DDFA';
                    break;
                case 'хард-скил': this._category.style.backgroundColor = '#FAA083';
                    break;            
            }
        }
    }

    set description(descriptionValue: string) {
        if (this._description) {
            this._description.textContent = descriptionValue;
        }
    }

    set id(idValue: string) {
        this.cardId = idValue;
    }

    get id(): string {
        return this.cardId || '';
    }

    set basketItem(itemValue: number) {
        this._basketItem.textContent = String(itemValue);
    }

    //метод понадобиться, чтобы изменить надпись на кнопке развернутой карточки. Кнопка может получить надпись 'Удалить', 'В корзину' и 'Товар бесценен' в этом случае кнопка должна становиться неактивной
    setCardButtonText(textContent: string):void {
        this._buttonModal.textContent = textContent;
    }

    getCardButtonText():string {
        if (this._buttonModal) {
            return this._buttonModal.textContent;
        }
    }

    //заблокировать кнопку покупки для Бесценных товаров
    protected disableCardButton(disableValue: boolean):void {
        this._buttonModal.disabled = disableValue;
    }

    //render(cardData?: Partial<ICard>): HTMLElement;
    //render(cardData: Partial<ICard>, cardInBasket: boolean): HTMLElement;

    render(cardData: Partial<ICard> | undefined, cardInBasket: boolean = false, cardPriceless: boolean = false, itemBasket: number = 0) {
        if (!cardData) return this.container;
        
        if (this._buttonModal) {
            if (cardInBasket) {
                this.setCardButtonText('Удалить из корзины');
                this.disableCardButton(false);
            } else {
                if (cardPriceless) {
                    this.setCardButtonText('Не продается');
                    this.disableCardButton(true);
                } else {
                    this.setCardButtonText('В корзину');
                    this.disableCardButton(false);
                }
            }   
        }

        if (this._basketItem) {
            this.basketItem = itemBasket;
        }
        //Object.assign(this, cardData);
        /*if (itemBasket) {
            this.basketItem = itemBasket;
            добавление порядкового номера элементу списка товара в корзине
        }*/
        //return this.container;
        return super.render(cardData);
    }
}