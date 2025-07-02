import { ViewComponent } from "./ViewComponent";

interface ICardsContainer {
    cardsCatalog: HTMLElement[];
}

export class CardsContainer extends ViewComponent<ICardsContainer> {
    protected _cardsCatalog: HTMLElement;

    //в контейксте проектной либо main class="gallery", либо ul class="basket__list" будет передаваться в качестве элемента-контейнера при создании экземпляра класса
    constructor(protected container: HTMLElement) {
        super(container);
    }

    //будет принимать и ставить в соответствующие элементы либо массив элементов карточек с главной страницы, либо li-элементы из корзины
    //поле должно совпадать с полем из ICardsContainer, иначе в Object.assign во ViewComponent не будет вызываться этот сеттер, так как поля не совпадут
    set cardsCatalog(cards: HTMLElement[]) {
        this.container.replaceChildren(...cards);
    }

    //рендер будет взят из родительского класса
}