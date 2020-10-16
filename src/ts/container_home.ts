import { Configuration } from "./module_config";


export interface AbstractContainerFactory {
    createContainer(container: JQuery, config?: Configuration): Container;
}


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



export class HomeContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        return new HomeContainer(container);
    }
}


export class HomeContainer extends Container {

    displayTooltip(element: JQuery): boolean {
        throw new Error("Method not implemented.");
    }
    
}