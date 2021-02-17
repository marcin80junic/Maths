
export abstract class Container {


    protected container: JQuery;

    constructor(container: JQuery) {
        this.container = container;
    }

    show (): Container { 
        this.container.fadeIn();
        return this;
    }
    hide (callback: Function): Container { 
        this.container.fadeOut(() => callback());
        return this;
    }

    abstract displayTooltip(element: JQuery): boolean;
    

}