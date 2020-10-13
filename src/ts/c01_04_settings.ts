import { AbstractContainerFactory, Container } from "./c01_00_container";



export class SettingsContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        return new SettingsContainer(container);
    }
}


export class SettingsContainer extends Container {
    
    show() {
        super.show();

    }

    hide(callback: Function) {
        super.hide(callback);

    }
    
    displayTooltip(): void {
        throw new Error("Method not implemented.");
    }
    
}