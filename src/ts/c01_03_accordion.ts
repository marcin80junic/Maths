import { Container, AbstractContainerFactory } from "./c01_00_container";
import { MathModule } from "./c02_00_module";
import { TestModule } from "./c02_02_test";
import { Configuration } from "./c02_03_config";



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