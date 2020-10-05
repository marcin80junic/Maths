import { MathModule } from "./c01_01_module";
import { Container } from "./c02_00_container";


export class ExerciseContainer implements Container {

    private container: JQuery;
    private module: MathModule;

    constructor(container: JQuery, content: MathModule) {
        this.container = container;
        this.module = content;
    }
    
    display(): void {
        throw new Error("Method not implemented.");
    }
    hide(): void {
        throw new Error("Method not implemented.");
    }
    displayTooltip(): void {
        throw new Error("Method not implemented.");
    }
    
}