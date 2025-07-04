import { ICard } from "../types";
import { cloneTemplate, ensureElement, stringifyPrice } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IAdditionalSettings {
    cardInBasket: boolean, 
    cardPriceless: boolean, 
    itemBasket: number,
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
    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        
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

        if (this._buttonModal) { //если в разметке карточки есть кнопка, то будем слушать клик по ней
            this._buttonModal.addEventListener('click', () => this.events.emit('cardButtonModal:click', {card: this}));
        } else if(this._buttonBasket) { //чтобы слушатель клика не навешивался на кнопку дважды при создании экзмепляра карточки в попае и экземпляра в корзине
            this._buttonBasket.addEventListener('click', () => this.events.emit('cardButtonDelete:click', {card: this/*cardId: this.id, cardElement: this.container*/}));
        } else { //если в разметке карточки нет кнопки, то слушаем клик по всей карточке
            container.addEventListener('click', () => this.events.emit('cardItem:select', {cardId: this.id}))
        }
    }

    set title(titleValue: string) {
        this._title.textContent = titleValue;
        if (this._image) {
            this._image.alt = titleValue;
        }
    }

    set price(priceValue: number | null) {
        if (priceValue) {
            this._price.textContent = `${stringifyPrice(priceValue)}`;
        } else {
            this._price.textContent = 'Бесценно';
        }
    }

    set image(linkValue: string) {
        if (this._image) {
            this._image.src = linkValue;
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

    render(cardData?: Partial<ICard>, additionalSettings?: Partial<IAdditionalSettings>) {
        if (!cardData) return this.container;
        
        if (this._buttonModal) {
            if (additionalSettings.cardInBasket) {
                this.setCardButtonText('Удалить из корзины');
                this.disableCardButton(false);
            } else {
                if (additionalSettings.cardPriceless) {
                    this.setCardButtonText('Не продается');
                    this.disableCardButton(true);
                } else {
                    this.setCardButtonText('В корзину');
                    this.disableCardButton(false);
                }
            }   
        }

        if (this._basketItem && additionalSettings.itemBasket) {
            this.basketItem = additionalSettings.itemBasket;
        }

        return super.render(cardData);
    }
}