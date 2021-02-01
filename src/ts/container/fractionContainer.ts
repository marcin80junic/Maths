import { ExerciseConfig } from "../config/exerciseConfig";
import { Configuration } from "../config/configuration";
import { MathModule } from "../maths/mathModule";
import { ExerciseContainer } from "./exerciseContainer";


export class FractionContainer extends ExerciseContainer {
    
    constructor(container: JQuery, content: MathModule, localConfig: ExerciseConfig) {
        super(container, content, localConfig);
    }

    protected setupGlobalConfig() {
        super.setupGlobalConfig();
        this.globalConfig.addListener(Configuration.EVENT_FRACTIONS, () => this.configChanged = true);
    }
    protected updateGlobalExercisesProps() {
        this.module.updateOperators(this.globalConfig.fractions_operators);
        super.updateGlobalExercisesProps();
    }

}