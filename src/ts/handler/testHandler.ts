import { AbstractExerciseHandler } from './exerciseHandlerAbstract';
import { MathModule } from "../maths/mathModule";



export class TestHandler extends AbstractExerciseHandler {

    private constructor(container: JQuery<HTMLElement>, module: MathModule) {
        super(container, module);
    }

    handleContent(): void {
        throw new Error("Method not implemented.");
    }
    
}