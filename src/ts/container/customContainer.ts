import { ExerciseConfig } from "../config/exerciseConfig";
import { Configuration } from "../config/configuration";
import { MathModule } from "../maths/mathModule";
import { ExerciseContainer } from "./exerciseContainer";


export class CustomContainer extends ExerciseContainer {
    
    constructor(container: JQuery, content: MathModule, localConfig: ExerciseConfig) {
        super(container, content, localConfig);
    }

    protected setupGlobalConfig() {
        super.setupGlobalConfig();
        this.globalConfig.addListener(Configuration.EVENT_CUSTOM, () => this.configChanged = true);
    }
    protected updateGlobalExercisesProps() {
        this.module.updateOperands(this.globalConfig.custom_operands);
        this.module.updateOperators(this.globalConfig.custom_operators);
        super.updateGlobalExercisesProps();
    }

}