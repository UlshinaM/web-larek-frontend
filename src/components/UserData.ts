import { IUser, IUserData, TPayMethod, TUserContact, TUserPayAddress } from "../types";
import { IEvents } from "./base/events";

export class UserData implements IUserData { //все методы на "удобных" данных работают
    protected payment: TPayMethod;
    protected address: string;
    protected email: string;
    protected phone: string;
    protected _total: number = 0;
    protected items: string[] = [];
    protected events: IEvents;

    constructor (events: IEvents) {
        this.events = events;
    }

    setUserInfo(userInfo: Partial<TUserPayAddress> & Partial<TUserContact>): void {
        Object.assign(this, userInfo);
    }

    addProductToBasket(productId: string): void {
        this.items.push(productId);
    }

    deleteProductFromBasket(productId: string): void {
        this.items = this.items.filter(cardId => cardId !== productId);
    }

    set total(totalPrice: number | null) {
        this._total = totalPrice;
    }

    getUserBasketProducts(): string[] {
        return this.items;
    }

    getUserOrderInfo(): IUser {
        return {payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone,
            total: this._total,
            items: this.items
        }
    }

    checkUserValidation(data: Partial<TUserPayAddress> | Partial<TUserContact>): void {
        if ('address' in data) {
            if (!!data.address && !!data.payment) {
                this.events.emit('formOrderValid:change', {validStatus: true, errors: ''});
            } else {
                this.events.emit('formOrderValid:change', {validStatus: false, errors: '*Заполните данные'});
            }
        }

        if ('email' in data) {
            if (!!data.email && !!data.phone) {
                this.events.emit('formContacts:change', {validStatus: true, errors: ''});
            } else {
                this.events.emit('formContacts:change', {validStatus: false, errors: '*Заполните данные'});
            }
        }
    }

    clearUserBasket(): void {
        this._total = 0;
        this.items = [];
        this.events.emit('basket:clear', {productsNumber: this.items.length});
    }

    //в контексте проектной после отправки полной формы заказа на сервер очистим информацию о пользователе, чтобы в случае чего на сервер не ушли некорректные данные
    clearUserInfo(): void {
        this.payment = null;
        this.address = '';
        this.email = '';
        this.phone = '';
    };
}