import { Container } from "./container";


export class TestContainer extends Container {


    constructor (container: JQuery) {
        super(container);
        this.createLevelChoiceButtons();

    }

    createLevelChoiceButtons(): void {

    }

    createTest(): void {

    }

    displayTooltip(): boolean {
        throw new Error("Method not implemented.");
    }

}