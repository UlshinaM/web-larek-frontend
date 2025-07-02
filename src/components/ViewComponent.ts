export abstract class ViewComponent<DataType> {
    constructor (protected container: HTMLElement) {}

    render(renderData?: Partial<DataType>): HTMLElement {
        Object.assign(this as object, renderData ?? {}); //оставляем пустой объект вместо данных на случай, если они не будут переданы
        return this.container;
    }
}