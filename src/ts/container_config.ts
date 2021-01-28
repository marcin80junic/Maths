import { MathModule } from "./module_math";



export class ExerciseConfig {

    private levelInput: JQuery;
    private exercisesCountInput: JQuery;
    private operationLengthInput: JQuery;

    private level_ns: string;
    private exercicesCount_ns: string;
    private operationLength_ns: string;
    private settings: Map<string, Function>;
    private readonly callback: Function;

    private _level: string = "0";
    private _exercisesCount: string = "8";
    private _operationLength: string = "2";

    constructor(namespace: string, callback: Function) {
        this.callback = callback;
        this.initPropsMap(namespace);
        this.loadProps();
    }

    private initPropsMap(namespace: string) {
        this.level_ns = `${namespace}.level`;
        this.exercicesCount_ns = `${namespace}.exercisesCount`;
        this.operationLength_ns = `${namespace}.operationLength`;
        this.settings = new Map([
            [this.level_ns, this.setLevel],
            [this.exercicesCount_ns, this.setExerciseCount],
            [this.operationLength_ns, this.setOperationLength]
        ]);
    }

    private loadProps() {
        let temp: string;
        for (let [key, value] of this.settings) {
            temp = this.accessStorage(key);
            if (temp) {
                value(temp);
            }
        }
    }
    
    private accessStorage(namespace: string, newValue?: string) {
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

    listen(parent: JQuery) {
        this.levelInput = parent.find('.level');
        this.exercisesCountInput = parent.find('.exercisesCount');
        this.operationLengthInput = parent.find('.operationLength');

        this.levelInput.on('change', () => {
            const name = this.levelInput.find("option:selected").text();
            this.level = MathModule.DIFFICULTIES.get(name);
            this.accessStorage(this.level_ns, '' + this.level);
            this.callback();
        });
        this.exercisesCountInput.on('change', () => {
            const textNumber = this.exercisesCountInput.find("option:selected").text();
            this.exercisesCount = parseInt(textNumber, 10);
            this.accessStorage(this.exercicesCount_ns, textNumber);
            this.callback();
        });
        this.operationLengthInput.on('change', () => {
            const textNumber = this.operationLengthInput.find("option:selected").text();
            this.operationLength = parseInt(textNumber, 10);
            this.accessStorage(this.operationLength_ns, textNumber);
            this.callback();
        });
    }

    private setLevel = (newLevel: string) => this._level = newLevel;
    private setExerciseCount = (newCount: string) => this._exercisesCount = newCount;
    private setOperationLength = (newLength: string) => this._operationLength = newLength;

    get level(): number { return parseInt(this._level, 10); }
    set level(newLevel: number) { this._level = `${newLevel}`}
    get exercisesCount(): number { return parseInt(this._exercisesCount, 10); }
    set exercisesCount(newCount) { this._exercisesCount = `${newCount}`; }
    get operationLength(): number { return parseInt(this._operationLength, 10); }
    set operationLength(newLength) { this._operationLength = `${newLength}`; }

}