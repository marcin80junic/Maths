
export interface ExerciseConfig {

    listen (container: JQuery, callback: Function): void

    getLevel(): number;

    getExercisesCount(): number;

    getOperationLength(): number;
    
}