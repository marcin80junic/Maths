
export abstract class Container {


    protected container: JQuery;

    constructor(container: JQuery) {
        this.container = container;
    }

    show() { 
        this.container.fadeIn();
    }
    hide(callback: Function) { 
        this.container.fadeOut(() => callback());
    }

    abstract displayTooltip(element: JQuery): boolean;
    

}