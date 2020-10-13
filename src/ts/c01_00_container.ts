import { Configuration } from "./c02_03_config";


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

    abstract displayTooltip(): boolean;

}



export class HomeContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        return new HomeContainer(container);
    }
}


export class HomeContainer extends Container {

    displayTooltip(): void {
        throw new Error("Method not implemented.");
    }
    
}