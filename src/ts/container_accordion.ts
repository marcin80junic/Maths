import { Container, AbstractContainerFactory } from "./container_home";
import { MathModule } from "./module_math";
import { TestModule } from "./module_test";



export class TestAccordionFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        return new TestContainer(container);
    }
}

export class TestContainer extends Container {

    private testModule: TestModule;
    private accordion: TestAccordion;

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


export class TestAccordion {

    private static instance: TestAccordion;
    private readonly showTooltips = false;

    constructor(container: JQuery) {
        
    }

    public static getAccordion(test: MathModule) {
        
    }

    
}