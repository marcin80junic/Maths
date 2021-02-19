import { AbstractExerciseHandler } from './exerciseHandlerAbstract';
import { TestMathModule } from '../maths/TestMathModule';
import { Configuration } from '../config/configuration';
import { MathModule } from '../maths/mathModule';
import { Timer } from '../media/timer';


export class TestHandler extends AbstractExerciseHandler {

    protected module: TestMathModule;
    private config: Configuration;
    private timer: Timer;

    constructor(container: JQuery<HTMLElement>, module: TestMathModule, timer: Timer) {
        super(container, module);
        this.module = module;
        this.timer = timer;
        this.config = Configuration.getConfig();
    }


    handleContent(callback?: Function): void {
        let scoreboard: object,
            changed = new Map(),
            unlocked = this.config.test_unlocked,
            time = this.timer.stop(),
            minutes = Math.floor(time / 60),
            seconds = time % 60;

        /* process test and determine score */
        for (let i = 0, length = this.module.getTestQuestionsCount(); i < length; i++) {
            if (super.processOperation(i)) {
                this.module.incrementScore(i);
            }
        }
        /* obtain scoreboard object from TestMathModule object */
        scoreboard = this.module.getDetailedScore();

        /* if score is 75% or higher, unlock the next level and augment the scorebord object */
        if (unlocked < 2 && scoreboard["testPercentage"] > 74) {
            changed.set(Configuration.TEST_UNLOCKED, `${++unlocked}`);
            this.config.save(changed);
            for (const [key, value] of MathModule.DIFFICULTIES) {
                if (value === unlocked) {
                    scoreboard["unlocked"] = key;
                    break;
                }
            }
        }
        /* augment the scorebord object with elapsed time */
        scoreboard["time"] = `${minutes} minute(s) ${seconds} seconds`;

        /* Accordion creator will generate a test summary */
        if (callback) {
            callback(scoreboard);
        }
    }
    
}