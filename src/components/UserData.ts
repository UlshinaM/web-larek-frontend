import { IUser, IUserData, TPayMethod, TUserBasket, TUserContact, TUserPayAddress } from "../types";
import { IEvents } from "./base/events";

export class UserData implements IUserData { //все методы на "удобных" данных работают, в презентере надо убрать возможность покупать бесценный товар
    protected payment: TPayMethod;
    protected address: string;
    protected email: string;
    protected phone: string;
    protected _total: number = 0;
    protected items: string[] = [];
    protected events: IEvents; //как будто пока не генерятся события

    constructor (events: IEvents) {
        this.events = events;
    }

    setUserInfo(userInfo: /*TUserBasket |*/ TUserPayAddress | TUserContact): void {
        //if (this.checkUserValidation(userInfo)) {
            if ('address' in userInfo) {
                this.payment = userInfo.payment;
                this.address = userInfo.address;
            } else if ('email' in userInfo) {
                this.email = userInfo.email;
                this.phone = userInfo.phone;
            } //else if ('total' in userInfo) {
                //this.items = [...this.items, ...userInfo.items];
                //this.total = userInfo.total;
                //this.events.emit('basket:change');
            //}
        //} else {
        //    console.log('Попытка ввода некорректных данных');
        //}    
    }

    addProductToBasket(productId: string): void {
        this.items.push(productId);
        this.events.emit('basket:change');
    }

    deleteProductFromBasket(productId: string): void {
        this.items = this.items.filter(cardId => cardId !== productId);
        this.events.emit('basket:change');
    }

    set total(totalPrice: number | null) {
        this._total = totalPrice;
    }

    get total() {
        return this._total;
    }

    getUserBasket(): TUserBasket {
        return {total: this._total,
            items: this.items
        }
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

    checkUserValidation(data: TUserBasket | TUserPayAddress | TUserContact): boolean {
        if ('address' in data) {
            this.events.emit('formPayAddressValidation:change');
            return !!(!!data.address && !!data.payment)
        }

        if ('email' in data) {
            this.events.emit('formContactValidation:change');
            return !!(!!data.email && !!data.phone)
        }

        if ('total' in data) {
            this.events.emit('formBasketValidation:change');
            return !!(data.total)
        }
    }

    clearUserBasket(): void {
        this._total = 0;
        this.items = [];
        this.events.emit('basket:change');
    }

    //в контексте проектной после отправки полной формы заказа на сервер очистим информацию о пользователе, чтобы в случае чего на сервер не ушли некорректные данные
    /*clearUserInfo(): void {
        this.payment = '';
        this.address = '';
        this.email = '';
        this.phone = '';
    }
    */
}