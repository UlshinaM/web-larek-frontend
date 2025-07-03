import { ApiForApp } from './components/ApiForApp';
import { Api } from './components/base/api';
import { EventEmitter, IEvents } from './components/base/events';
import { Basket } from './components/Basket';
import { Card } from './components/Card';
import { CardsContainer } from './components/CardsContainer';
import { CardsData } from './components/CardsData';
import { Form } from './components/Form';
import { Modal } from './components/Modal';
import { OrderSuccess } from './components/OrderSuccess';
import { Page } from './components/Page';
import { UserData } from './components/UserData';
import './scss/styles.scss';
import { ICard, IOrderResult, TPayMethod, TUserContact, TUserPayAddress } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { cloneTemplate } from './utils/utils';

//константы для проверки работы моделей данных
const cardsArrayForTest = [
        {
            "id": "854cef69-976d-4c2a-a18c-2aa45046c390",
            "description": "Если планируете решать задачи в тренажёре, берите два.",
            "image": "/5_Dots.svg",
            "title": "+1 час в сутках",
            "category": "софт-скил",
            "price": 750
        },
        {
            "id": "c101ab44-ed99-4a54-990d-47aa2bb4e7d9",
            "description": "Лизните этот леденец, чтобы мгновенно запоминать и узнавать любой цветовой код CSS.",
            "image": "/Shell.svg",
            "title": "HEX-леденец",
            "category": "другое",
            "price": 1450
        },
        {
            "id": "b06cde61-912f-4663-9751-09956c0eed67",
            "description": "Будет стоять над душой и не давать прокрастинировать.",
            "image": "/Asterisk_2.svg",
            "title": "Мамка-таймер",
            "category": "софт-скил",
            "price": null
        },
        {
            "id": "412bcf81-7e75-4e70-bdb9-d3c73c9803b7",
            "description": "Откройте эти куки, чтобы узнать, какой фреймворк вы должны изучить дальше.",
            "image": "/Soft_Flower.svg",
            "title": "Фреймворк куки судьбы",
            "category": "дополнительное",
            "price": 2500
        },
        {
            "id": "1c521d84-c48d-48fa-8cfb-9d911fa515fd",
            "description": "Если орёт кот, нажмите кнопку.",
            "image": "/mute-cat.svg",
            "title": "Кнопка «Замьютить кота»",
            "category": "кнопка",
            "price": 2000
        },
        {
            "id": "f3867296-45c7-4603-bd34-29cea3a061d5",
            "description": "Чтобы научиться правильно называть модификаторы, без этого не обойтись.",
            "image": "Pill.svg",
            "title": "БЭМ-пилюлька",
            "category": "другое",
            "price": 1500
        },
        {
            "id": "54df7dcb-1213-4b3c-ab61-92ed5f845535",
            "description": "Измените локацию для поиска работы.",
            "image": "/Polygon.svg",
            "title": "Портативный телепорт",
            "category": "другое",
            "price": 100000
        },
        {
            "id": "6a834fb8-350a-440c-ab55-d0e9b959b6e3",
            "description": "Даст время для изучения React, ООП и бэкенда",
            "image": "/Butterfly.svg",
            "title": "Микровселенная в кармане",
            "category": "другое",
            "price": 750
        },
        {
            "id": "48e86fc0-ca99-4e13-b164-b98d65928b53",
            "description": "Очень полезный навык для фронтендера. Без шуток.",
            "image": "Leaf.svg",
            "title": "UI/UX-карандаш",
            "category": "хард-скил",
            "price": 10000
        },
        {
            "id": "90973ae5-285c-4b6f-a6d0-65d1d760b102",
            "description": "Сжимайте мячик, чтобы снизить стресс от тем по бэкенду.",
            "image": "/Mithosis.svg",
            "title": "Бэкенд-антистресс",
            "category": "другое",
            "price": 1000
        }
];
const userObjectForTest = {payment: "online",
    email: "test@test.ru",
    phone: "+71234567890",
    address: "Spb Vosstania 1",
    total: 2200,
    items: [
        "854cef69-976d-4c2a-a18c-2aa45046c390",
        "c101ab44-ed99-4a54-990d-47aa2bb4e7d9"
    ]
};
//const testEvents = new EventEmitter();  

const events/*: IEvents*/ = new EventEmitter();


//API для общения с сервером
const api = new Api(API_URL, settings);
const apiForApp = new ApiForApp(api, CDN_URL);

//Объекты - модели данных
const cardsData = new CardsData(events);
const userData = new UserData(events);

//Темплейты карточки
const cardTemplate: HTMLTemplateElement = document.querySelector('#card-catalog');
const cardModalTemplate: HTMLTemplateElement = document.querySelector('#card-preview');
const cardBasketTemplate: HTMLTemplateElement = document.querySelector('#card-basket');

//Куда встраивать карточку
const mainSection: HTMLElement = document.querySelector('.gallery');//секция main основной страницы
const modalPopup: HTMLDivElement = document.querySelector('.modal');//модальное окно, в котором будет выводдиться все
const modalPopupContent: HTMLDivElement = modalPopup.querySelector('.modal__content');//куда вставлять контент модального окна
const mainPage: HTMLBodyElement = document.querySelector('.page');//body
//const popupContent: HTMLDivElement = modalPopup.querySelector('.modal__content');

//Клонируем все необходимые темплейты
//Темплейты карточки
const templateCardCatalog = cloneTemplate(document.querySelector('#card-catalog') as HTMLTemplateElement);
const templateCardModal = cloneTemplate(document.querySelector('#card-preview') as HTMLTemplateElement);
const templateCardBasket = cloneTemplate(document.querySelector('#card-basket') as HTMLTemplateElement);
//Темплейт корзины
const templateBasketModal = cloneTemplate(document.querySelector('#basket') as HTMLTemplateElement);
//Темплейт форм и подтверждения
const templateOrderPay = cloneTemplate(document.querySelector('#order') as HTMLTemplateElement) as HTMLFormElement;
const templateOrderContacts = cloneTemplate(document.querySelector('#contacts') as HTMLTemplateElement) as HTMLFormElement;
const templateSuccess = cloneTemplate(document.querySelector('#success') as HTMLTemplateElement);

events.onAll((evt) => {console.log(evt.eventName, evt.data)});

//Создаем необходимые классы для отображения
const page = new Page(mainPage, events);
const modal = new Modal(modalPopup, events);
const basket = new Basket(templateBasketModal, events);
//Будут нужны в других местах, но пока пусть будут здесь
const cardModal = new Card(templateCardModal, events);
const cardBasket = new Card(templateCardBasket, events);
const orderSuccess = new OrderSuccess(templateSuccess, events);
const formPay = new Form(templateOrderPay, events);
const formContacts = new Form(templateOrderContacts, events);


//cardsData.cards = cardsArrayForTest;
//const cardForTest = cardsData.getCard('412bcf81-7e75-4e70-bdb9-d3c73c9803b7');

//проверяем отображение карточки товара по переданным данным
//const card = new Card(cloneTemplate(cardTemplate), events, {onClick: (event: MouseEvent) => testEvents.emit('button:toBasket', {card: cardForTest.id})});
//const card2 = new Card(cloneTemplate(cardTemplate), events, {onClick: (event: MouseEvent) => testEvents.emit('button:toBasket', {card: cardForTest.id})});

//const cardArr = [];
//cardArr.push(card.render(cardsArrayForTest[0]));
//cardArr.push(card2.render(cardsArrayForTest[2]));
//const cardsContainer = new CardsContainer(mainSection);

//cardsContainer.render({cardsCatalog: cardArr});

//card.title = cardForTest.title;
//card.id = cardForTest.id;
//card.image = 'https://larek-api.nomoreparties.co/content/weblarek' + cardForTest.image;
//card.category = cardForTest.category;
//card.price = cardForTest.price;
//card.description = cardForTest.description;
//modalPopup.classList.add('modal_active');
//console.log(card.render(cardsArrayForTest[0]));
//popupContent.append(card.render(cardsArrayForTest[0]));
//card2.basketItem = 2;

//card.render({}, true);

//card.setCardButtonText('Убрать из корзины');

apiForApp.getCards()
    .then((cardsArray) => {
        cardsData.cards = cardsArray;
        //userData.total = cardsData.getTotalPrice(userData.getUserBasket().items);
        // работает apiForApp.postOrderUserData(userData.getUserOrderInfo());
        // работает console.log(cardsData.getCard(cardsData.selectedCard), cardsData.cards);
        /* работает
        const cards: Card[] = [];
        cardsData.cards.forEach((cardDat, index) => {
            cards[index] = new Card(cardTemplate, events, {onClick: (event: MouseEvent) => testEvents.emit('card:select', {card: cardDat})});
            cards[index].title = cardDat.title;
            cards[index].id = cardDat.id;
            cards[index].image = cardDat.image;
            cards[index].category = cardDat.category;
            cards[index].price = cardDat.price;
            mainSection.append(cards[index].render());
        });
        */
        events.emit('cardData:loaded');
    })
    .catch((error) => {
        console.log(error);
    });

events.on('cardData:loaded', () => {
    const cardElements = cardsData.cards.map((card) => {
        const cardItem = new Card(cloneTemplate(cardTemplate), events);
        return cardItem.render(card);
    });

    page.render({gallery: cardElements,
        counter: userData.getUserBasketProducts().length ?? 0,
        locked: false
    });

});

//попробуем открыть попап с карточкой
events.on('cardItem:select', (event: {cardId: string}) => {
    const cardPreviewElement = new Card(cloneTemplate(cardModalTemplate), events);
    const renderCard = cardsData.getCard(event.cardId);
    const isBasket = userData.getUserBasketProducts().some((productId) => productId === event.cardId);
    const isPriceless = renderCard.price === null;
    modal.render({content: cardPreviewElement.render(renderCard, isBasket, isPriceless)});
    //modal.open();
});

// Блокируем и разблокируем прокрутку страницы, когда окрывается / закрывается модальное окно
events.on('modal:opened', () => {
    page.render({locked: true});
});

events.on('modal:closed', () => {
    page.render({locked: false});
});

//добавляем и убираем товар по кнопке в модальном окне товара    
events.on('cardButtonModal:click', (dataCardElement: {card: Card}) => {
    switch (dataCardElement.card.getCardButtonText()) {
        case 'В корзину': userData.addProductToBasket(dataCardElement.card.id);
            dataCardElement.card.render({}, true);
            break;
        case 'Удалить из корзины': userData.deleteProductFromBasket(dataCardElement.card.id);
            dataCardElement.card.render({}, false);
            break;
    }
    page.render({counter: userData.getUserBasketProducts().length});
});

//функция для рендера корзины, можно использовать при открытии и удалении товаров, если находишься в корзине
function reRenderBasket() {
    const productElements = userData.getUserBasketProducts().map((productId, productIndex) => {
        const productItem = new Card(cloneTemplate(cardBasketTemplate), events);
        return productItem.render(cardsData.getCard(productId), false, false, productIndex + 1);
    });

    modal.render({
        content: basket.render({cards: productElements,
            total: cardsData.getTotalPrice(userData.getUserBasketProducts()),
        }),
    });
};

//убираем товар по иконке удаления в корзине
events.on('cardButtonDelete:click', (dataCardElement: {card: Card}) => {
    userData.deleteProductFromBasket(dataCardElement.card.id);
    reRenderBasket();
    page.render({counter: userData.getUserBasketProducts().length});
});

//попробуем открыть корзину с товарами
events.on('basket:open', () => {
    reRenderBasket();
    //page.render()
});

events.on('basket:change', () => {
    //reRenderBasket();
    page.render({counter: userData.getUserBasketProducts().length});
});

//Открываем формочку "Способ оплаты и адрес" по кнопке "Оформить" из корзины
events.on('basket:placed', () => {
    //массив с id товаров в объекте с данными пользователя уже заполнен, а общей стоимости корзины еще нет
    userData.total = cardsData.getTotalPrice(userData.getUserBasketProducts());
    //Кнопка Оформить сразу ведет к открытию модалки с формой
    modal.render({
        content: formPay.render({valid: false,
            errors: '*Заполните данные',
        }),
    });

    const orderPayment: TUserPayAddress = {payment: null, address: ''};

    events.on('orderpayment:input', (data: {payment: string}) => {
        orderPayment.payment = data.payment as TPayMethod;
        userData.checkUserValidation(orderPayment);
    });

    events.on('order:input', (data: {field: string, value: string}) => {
        orderPayment.address = data.value;
        userData.checkUserValidation(orderPayment);
    });

    events.on('formOrder:change', (validation: {validStatus: boolean, errors: string}) => {
        formPay.render({valid: validation.validStatus,
            errors: validation.errors,
        });
    });

    events.on('order:submit', (payData: TUserPayAddress) => {
        userData.setUserInfo(payData);
        formPay.clearForm();
        //console.log(userData.getUserOrderInfo());
        modal.render({
            content: formContacts.render({valid: false,
                errors: '*Заполните данные',
            }),
        });

        const orderContacts: TUserContact = {email: '', phone: ''};
        events.on('contacts:input', (data: {field: string, value: string}) => {
            //const inputData = {[data.field]};
            if (data.value) {
                Object.assign(orderContacts, {[data.field]: data.value});
            } else {
                const field = data.field as keyof TUserContact;
                orderContacts[field] = '';
            }
            
            userData.checkUserValidation(orderContacts);
        });

        events.on('formContacts:change', (validation: {validStatus: boolean, errors: string}) => {
        formContacts.render({valid: validation.validStatus,
            errors: validation.errors,
        });

        events.on('contacts:submit', (contactsData: TUserContact) => {
            userData.setUserInfo(contactsData);
            //console.log(userData.getUserOrderInfo());
            formContacts.clearForm();

            /*apiForApp.postOrderUserData(userData.getUserOrderInfo())
                .then((orderResult: IOrderResult) => {
                    events.emit('order:succes', {orderPrice: orderResult.total});
                })
                .catch((error) => {
                    console.log(error);
                });
            */    
            events.emit('order:succes', {orderPrice: userData.getUserOrderInfo().total});
            events.on('order:succes', (price: {orderPrice: number}) => {
                modal.render({
                    content: orderSuccess.render({total: price.orderPrice}),
                });

                userData.clearUserBasket();
            });    
            
            events.on('orderSuccess:close', () => {modal.close()})
        });
    });
    });
});

/*1. Разобраться с отработкой событий форм
2. с их очисткой и нормальной проверкой
3. вынести в функцию штуку для отображения стоимости
4. вместо генерации события при проверке формы просто возвращать объект и его обрабатывать?
5. внимательно проверить, что сохраняется в товарах пользователя, а что нет при открытии / закрытии модалок
6. сделать очистку формы по условию при закрытии модального окна, расширить метод close()
7. когда переходим к новой форме старую модалку как бы закрываем
*/