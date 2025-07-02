import { IEvents } from "./base/events";
import { ViewComponent } from "./ViewComponent";

interface IModalContent {
    content: HTMLElement;
}

export class Modal extends ViewComponent<IModalContent> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;
    protected events: IEvents;

    constructor(protected container: HTMLElement, events: IEvents) {
        super(container);

        this.events = events;

        this._closeButton = container.querySelector('.modal__close');
        this._content = container.querySelector('.modal__content');

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', (evt) => {
            if (evt.target === evt.currentTarget) {
                this.close();
            }
        });
        this.handleEscButton = this.handleEscButton.bind(this);
    };

    set content(modalContent: HTMLElement) {
        this._content.replaceChildren(modalContent);
    };

    open() {
        this.container.classList.add('modal_active');
        document.addEventListener('keydown', this.handleEscButton);
        this.events.emit('modal:opened');
    };

    close() {
        this.container.classList.remove('modal_active');
        this.content = null;
        document.removeEventListener('keydown', this.handleEscButton);
        this.events.emit('modal:closed');
    };

    handleEscButton (evt: KeyboardEvent) {
        if (evt.key === 'Escape') {
            this.close();
        }
    }

    render(data: IModalContent): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}