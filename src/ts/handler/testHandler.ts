import { AbstractExerciseHandler } from './exerciseHandlerAbstract';
import { TestMathModule } from '../maths/TestMathModule';



export class TestHandler extends AbstractExerciseHandler {

    module: TestMathModule;
    scores: number[];

    constructor(container: JQuery<HTMLElement>, module: TestMathModule) {
        super(container, module);
        this.module = module;
        this.scores = [];
    }


    handleContent(callback?: Function): void {
        
        for (let i = 0, length = this.module.getTestQuestionsCount(); i < length; i++) {
            if (super.processOperation(i)) {
                this.module.incrementScore(i);
            }
        }
        if (callback) {
            callback(this.module.getDetailedScore());
        }
    }
    
}