import { TPayMethod } from "../types";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IFormState {
    valid: boolean;
    errors: string;
}

export class Form<T> extends ViewComponent<IFormState> {
    protected _submitButton: HTMLButtonElement;
    protected _paymentButton?: NodeListOf<HTMLButtonElement>;
    protected _inputs: NodeListOf<HTMLInputElement>;
    protected _errors: HTMLSpanElement;
    protected _payment?: TPayMethod;
    protected formName: string;
    protected events: IEvents;
    
    constructor(protected container: HTMLFormElement, events: IEvents) {
        super(container);
        this.events = events;

        this.formName = container.getAttribute('name'); 
        this._paymentButton = container.querySelectorAll('.button_alt');
        this._inputs = container.querySelectorAll('.form__input');
        this._submitButton = container.querySelector('.order__button');
        this._errors = container.querySelector('.form__errors');

        this._paymentButton.forEach((payButton) => {
            payButton.addEventListener('click', (evt) => {
                const target = evt.target as HTMLButtonElement;
                //добавить выбранной по target кнопке стилей
                target.classList.add('button_alt-active');
                this._payment = target.getAttribute('name') as TPayMethod;
                this.events.emit(`${this.formName}payment:input`, {payment: target.getAttribute('name')});
            });
        });

        this.errors = '';

        this.container.addEventListener('submit', (evt) => {
            evt.preventDefault();
            this.events.emit(`${this.formName}:submit`, this.getInputValues());
        });

        this.container.addEventListener('input', (evt: InputEvent) => {
            const target = evt.target as HTMLInputElement;
            const field = target.getAttribute('name');
            const value = target.value;
            this.events.emit(`${this.formName}:input`, {field, value});
        });
    }

    set errors(errorMessage: string) {
        this._errors.textContent = errorMessage;
        //возможно, понадобятся стили
    }

    set valid(validationResult: boolean) {
        //возможно, нужны стили
        this._submitButton.disabled = !validationResult;
        if (validationResult) {
            this.errors = '';
        }
    }

    protected getInputValues(): object {
        const formDataObject: Record<string, string> = {};
        this._inputs.forEach((input) => {
            formDataObject[input.name] = input.value;
        });
        if (this._payment) {
            formDataObject['payment'] = this._payment;
        }
        return formDataObject;
    }

    //расширяем родительский метод
    render(formState: Partial<T> & Partial<IFormState>) {
        const {valid, errors, ...inputs} = formState;
        super.render({valid, errors});
        Object.assign(this, inputs);
        return this.container;

    }

    clearForm() {
        this.container.reset();
        if (this._payment) {
            //убрать у выбранной кнопки стили по toggle по name из _payment
            this._paymentButton.forEach((paymentButton) => {
                if (paymentButton.classList.contains('button_alt-active')) {
                    paymentButton.classList.remove('button_alt-active');
                }
            });
            this._payment = null;
        }
    };
}