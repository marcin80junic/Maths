import { MathModule } from "../maths/mathModule";
import { ExerciseConfig } from "./exerciseConfig";



export class LocalExerciseConfig implements ExerciseConfig {

    private levelInput: JQuery;
    private exercisesCountInput: JQuery;
    private operationLengthInput: JQuery;

    private level_ns: string;
    private exercicesCount_ns: string;
    private operationLength_ns: string;
    private settings: Map<string, Function>;

    private _level: string = "0";
    private _exercisesCount: string = "8";
    private _operationLength: string = "2";

    constructor (namespace: string) {
        this.initPropsMap(namespace);
        this.loadProps();
    }

    private initPropsMap (namespace: string) {
        this.level_ns = `${namespace}.level`;
        this.exercicesCount_ns = `${namespace}.exercisesCount`;
        this.operationLength_ns = `${namespace}.operationLength`;
        this.settings = new Map([
            [this.level_ns, this.setLevel],
            [this.exercicesCount_ns, this.setExerciseCount],
            [this.operationLength_ns, this.setOperationLength]
        ]);
    }

    private loadProps () {
        let temp: string;
        for (let [key, value] of this.settings) {
            temp = this.accessStorage(key);
            if (temp && temp !== 'undefined') {
                value(temp);
            }
        }
    }
    
    private accessStorage (namespace: string, newValue?: string) {
        try {
            if (typeof Storage !== "undefined") {
                if (newValue) {
                    localStorage.setItem(namespace, newValue);
                } else {
                    let loaded = localStorage.getItem(namespace);
                    return loaded;
                }
            }
        } catch(error) {
            console.error("can't access the local storage");
        }
    }

    listen (parent: JQuery, callback: Function) {
        this.levelInput = parent.find('.level');
        this.exercisesCountInput = parent.find('.exercisesCount');
        this.operationLengthInput = parent.find('.operationLength');

        this.levelInput.on('change', () => {
            const name = this.levelInput.find("option:selected").text();
            this.level = MathModule.DIFFICULTIES.get(name);
            this.accessStorage(this.level_ns, '' + this._level);
            callback();
        });
        this.exercisesCountInput.on('change', () => {
            const textNumber = this.exercisesCountInput.find("option:selected").text();
            this.exercisesCount = parseInt(textNumber, 10);
            this.accessStorage(this.exercicesCount_ns, textNumber);
            callback();
        });
        this.operationLengthInput.on('change', () => {
            const textNumber = this.operationLengthInput.find("option:selected").text();
            this.operationLength = parseInt(textNumber, 10);
            this.accessStorage(this.operationLength_ns, textNumber);
            callback();
        });
    }

    private setLevel = (newLevel: string) => this._level = newLevel;
    private setExerciseCount = (newCount: string) => this._exercisesCount = newCount;
    private setOperationLength = (newLength: string) => this._operationLength = newLength;

    getLevel = () => parseInt(this._level, 10)
    private set level (newLevel: number) { this._level = `${newLevel}`}

    getExercisesCount = () => parseInt(this._exercisesCount, 10)
    private set exercisesCount (newCount: number) { this._exercisesCount = `${newCount}`; }
    
    getOperationLength = () => parseInt(this._operationLength, 10)
    private set operationLength (newLength: number) { this._operationLength = `${newLength}`; }

}