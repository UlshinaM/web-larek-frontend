import { TPayMethod } from "../types";
import { isTPayMethod } from "../utils/utils";
import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IFormState {
    valid: boolean;
    errors: string;
    activeButton: string;
};

//let isEventListener: boolean = false;

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

        this.errors = '';

        this._paymentButton.forEach((payButton) => {
            payButton.addEventListener('click', (evt) => {
                const target = evt.target as HTMLButtonElement;
                if (isTPayMethod(target.getAttribute('name'))) {
                    this._payment = target.getAttribute('name') as TPayMethod;
                }
                this.events.emit(`${this.formName}payment:input`, {payment: target.getAttribute('name')});
            });
        });

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
    }

    set valid(validationResult: boolean) {
        //возможно, нужны стили
        this._submitButton.disabled = !validationResult;
        if (validationResult) {
            this.errors = '';
        }
    }

    set activeButton(buttonName: string) {
        this._paymentButton.forEach((payButton) => {
            if (payButton.name === buttonName) {
                payButton.classList.add('button_alt-active');
            } else {
                payButton.classList.remove('button_alt-active');
            }
        });
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
}