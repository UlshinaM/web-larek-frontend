import { ApiForApp } from './components/ApiForApp';
import { Api } from './components/base/api';
import { EventEmitter, IEvents } from './components/base/events';
import { Basket } from './components/Basket';
import { Card } from './components/Card';
import { CardsData } from './components/CardsData';
import { Form } from './components/Form';
import { Modal } from './components/Modal';
import { OrderSuccess } from './components/OrderSuccess';
import { Page } from './components/Page';
import { UserData } from './components/UserData';
import './scss/styles.scss';
import { ICard, IOrderResult, TPayMethod, TUserContact, TUserPayAddress } from './types';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { cloneTemplate, isTPayMethod } from './utils/utils'; 

const events = new EventEmitter();

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
//Остальные темплейты
const templateBasketModal = document.querySelector('#basket');
const templateOrderPay = document.querySelector('#order');
const templateOrderContacts = document.querySelector('#contacts');
const templateSuccess = document.querySelector('#success');

//Куда встраивать карточку и не только
const modalPopup: HTMLDivElement = document.querySelector('.modal');//модальное окно, в котором будет выводдиться все
const mainPage: HTMLBodyElement = document.querySelector('.page');//body

//events.onAll((evt) => {console.log(evt.eventName, evt.data)});

//Создаем необходимые классы для "глобального" отображения
const page = new Page(mainPage, events);
const modal = new Modal(modalPopup, events);

apiForApp.getCards()
    .then((cardsArray) => {
        cardsData.cards = cardsArray;
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
    modal.render({content: cardPreviewElement.render(renderCard, {cardInBasket: isBasket, cardPriceless: isPriceless})});
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
            dataCardElement.card.render({}, {cardInBasket: true});
            break;
        case 'Удалить из корзины': userData.deleteProductFromBasket(dataCardElement.card.id);
            dataCardElement.card.render({}, {cardInBasket: false});
            break;
    }
    page.render({counter: userData.getUserBasketProducts().length});
});

//функция для рендера корзины, можно использовать при открытии и удалении товаров, если находишься в корзине
function getRenderedBasketProducts(): HTMLElement[] {
    const productElements = userData.getUserBasketProducts().map((productId, productIndex) => {
        const productItem = new Card(cloneTemplate(cardBasketTemplate), events);
        return productItem.render(cardsData.getCard(productId), {itemBasket: productIndex + 1});
    });

    return productElements;
};

//попробуем открыть корзину с товарами
events.on('basket:open', () => {
    if (templateBasketModal instanceof HTMLTemplateElement) {
        const basket = new Basket(cloneTemplate(templateBasketModal), events);

        modal.render({
            content: basket.render({
                cards: getRenderedBasketProducts(),
                total: cardsData.getTotalPrice(userData.getUserBasketProducts()),
            }),
        });

        //убираем товар по иконке удаления в корзине
        events.on('cardButtonDelete:click', (dataCardElement: {card: Card}) => {
            userData.deleteProductFromBasket(dataCardElement.card.id); //убираем из данных пользователя
            //отображаем, что убрали
            basket.render({
                cards: getRenderedBasketProducts(),
                total: cardsData.getTotalPrice(userData.getUserBasketProducts()),
            });
            page.render({counter: userData.getUserBasketProducts().length});
        });
    }
    
});

events.on('basket:clear', () => {
    page.render({counter: 0});
});

//Открываем формочку "Способ оплаты и адрес" по кнопке "Оформить" из корзины
events.on('basket:placed', () => {
    //массив с id товаров в объекте с данными пользователя уже заполнен, а общей стоимости корзины еще нет
    userData.total = cardsData.getTotalPrice(userData.getUserBasketProducts());
    modal.close();//для имитации поведения, что одно модальное окошко закрылось, а другое открылось
    //Кнопка Оформить сразу ведет к открытию модалки с формой
    if (templateOrderPay instanceof HTMLTemplateElement) {
        const formOrder = new Form(cloneTemplate(templateOrderPay), events);

        modal.render({
            content: formOrder.render({
                valid: false,
                errors: '*Заполните данные',
            }),
        });

        const orderPayment: TUserPayAddress = {payment: null, address: ''};
        const paymentInputCallback = (data: {payment: string}) => {
            if (isTPayMethod(data.payment)) {
                formOrder.render({activeButton: data.payment});
                orderPayment.payment = data.payment as TPayMethod;
                userData.checkUserValidation(orderPayment);
            }
        };

        const orderInputCallback = (data: {field: string, value: string}) => {
            orderPayment.address = data.value;
            userData.checkUserValidation(orderPayment);
        };

        const formOrderValidCallback = (validation: {validStatus: boolean, errors: string}) => {
            formOrder.render({
                valid: validation.validStatus,
                errors: validation.errors,
            });
        };

        events.on('orderpayment:input', paymentInputCallback);
        events.on('order:input', orderInputCallback);
        events.on('formOrderValid:change', formOrderValidCallback);

        events.on('modal:closed', () => {
            events.off('orderpayment:input', paymentInputCallback);
            events.off('order:input', orderInputCallback);
            events.off('formOrderValid:change', formOrderValidCallback);
        });
    }
});

events.on('order:submit', (payData: TUserPayAddress) => {
    userData.setUserInfo(payData);
    modal.close();

    if (templateOrderContacts instanceof HTMLTemplateElement) {
        const formContacts = new Form(cloneTemplate(templateOrderContacts), events);
        modal.render({
            content: formContacts.render({
                valid: false,
                errors: '*Заполните данные',
            }),
        });

        const orderContacts: TUserContact = {email: '', phone: ''};
        const contactInputCallback = (data: {field: string, value: string}) => {
            if (data.value) {
                Object.assign(orderContacts, {[data.field]: data.value});
            } else {
                const field = data.field as keyof TUserContact;
                orderContacts[field] = '';
            };
            
            userData.checkUserValidation(orderContacts);
        }
        const formContactsCallback = (validation: {validStatus: boolean, errors: string}) => {
            formContacts.render({
                valid: validation.validStatus,
                errors: validation.errors,
            });
        }

        events.on('contacts:input', contactInputCallback);

        events.on('formContacts:change', formContactsCallback);

        events.on('modal:closed', () => {
            events.off('contacts:input', contactInputCallback);
            events.off('formContacts:change', formContactsCallback);
        });
    }
});

events.on('contacts:submit', (contactsData: TUserContact) => {
    userData.setUserInfo(contactsData);

    apiForApp.postOrderUserData(userData.getUserOrderInfo())
        .then((orderResult: IOrderResult) => {
            userData.clearUserBasket();
            userData.clearUserInfo();
            events.emit('order:succes', {orderPrice: orderResult.total});
        })
        .catch((error) => {
            console.log(error);
        });
});

events.on('order:succes', (price: {orderPrice: number}) => {
    if (templateSuccess instanceof HTMLTemplateElement) {
        const orderSuccess = new OrderSuccess(cloneTemplate(templateSuccess), events);

        modal.render({
            content: orderSuccess.render({total: price.orderPrice}),
        });

        const orderSuccessCloseCallback = () => {modal.close()};
        events.on('orderSuccess:close', orderSuccessCloseCallback);
        events.on('modal:closed', () => {
            events.off('orderSuccess:close', orderSuccessCloseCallback);
        });    
    };    
});