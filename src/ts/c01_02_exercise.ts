import $ from 'jquery';
import { MathModule, MathModuleBuilder } from "./c02_00_module";
import { AbstractContainerFactory, Container } from "./c01_00_container";
import { Operator, OperatorFactory } from './c03_01_00_operators';
import { Operand } from './c03_00_01_operands';
import { Configuration } from "./c02_03_config";
import { OperationElement } from './c03_00_00_oper-element';



export class AdditionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName('addition')
            .setOparators(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}
export class SubtractionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName('subtraction')
            .setOparators(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}
export class MultiplicationContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName('multiplication')
            .setOparators(OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}
export class DivisionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName('division')
            .setOparators(OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}
export class FractionsContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName('fractions')
            .setOparators(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}
export class CustomContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {

        return new ExerciseContainer(container, null);
    }
}


export class ExerciseContainer extends Container {
    
    private innerContainer: JQuery;
    private readonly globalConfig: Configuration;
    private readonly localConfig: ExerciseConfig;
    private readonly module: MathModule;
    private globalConfigChanged: boolean;
    private showTooltips: boolean;
    private interfaceContainer: JQuery;
    private mainContainer: JQuery;
    private buttonContainer: JQuery;

    constructor(container: JQuery, content: MathModule) {
        super(container);
        this.module = content;
        this.globalConfig = Configuration.getConfig();
        this.globalConfig.subscribe(() => this.globalConfigChanged = true);
        this.updateGlobalProps();
        this.localConfig = new ExerciseConfig(this.module.name, () => this.updateLocalProps());
        this.updateLocalProps();
        this.createContainers();
        this.localConfig.listen(this.interfaceContainer);

    }

    updateGlobalProps() {
        this.showTooltips = this.globalConfig.general_tooltips;
        this.module.randomize = this.globalConfig.general_randomize
        this.globalConfigChanged = false;
    }

    updateLocalProps() {
        this.module.level = this.localConfig.level;
        this.module.exercisesCount = this.localConfig.exercisesCount;
        this.module.operationLength = this.localConfig.operationLength;
        this.module.init();
        if (this.mainContainer) {
            this.mainContainer.html(ExerciseContainer.createMainContainer(this.module, false));
        }
    }
    
    show() {
        if (this.globalConfigChanged) {
            this.updateGlobalProps();
            this.module.init();
            this.mainContainer.html(ExerciseContainer.createMainContainer(this.module, false));
        }
        super.show();
    }

    hide(callback: Function) {
        super.hide(callback)
    }

    displayTooltip(): boolean {
        throw new Error("Method not implemented.");
    }

    private createContainers(): void {
        this.innerContainer = this.container.find(`#${this.module.name}-exercises`);
        this.interfaceContainer = $(this.createInterfaceContainer());
        this.mainContainer = $(ExerciseContainer.createMainContainer(this.module, false));
        this.buttonContainer = $(this.createButtonsContainer());
        this.innerContainer.append(this.interfaceContainer, this.mainContainer, this.buttonContainer);
    }

    private createInterfaceContainer(): string {
        let html = '<div class="interface">';

        // level selection
        html += `<div class="interface-item">               
                    <label for="level">Difficulty:</label>
                    <select class="level form-element ${Configuration.noTouchClass}">`;

                for (const [key, value] of MathModule.DIFFICULTIES) {
                    console.log(`this.module.level = ${this.module.level}, value = ${value}`)
                    html += (this.module.level === value) ?
                        `<option selected="selected">${key}</option>`
                        : `<option>${key}</option>`;
                };
            html += `</select>
                </div>`;        // end of level selection

        // number of exercises choice
        html += `<div class="interface-item">               
                    <label for="exercisesCount">How many exercises?</label>
                    <select class="exercisesCount form-element ${Configuration.noTouchClass}">`;
                for (const value of MathModule.NUM_OF_EXERCISES) {
                    html += (this.module.exercisesCount === value) ?
                        `<option selected="selected">${value}</option>`
                        : `<option>${value}</option>`;
                };
            html += `</select>
                </div>`;        // end of num of exercises choice
        
        // operation length choice
        html += `<div class="interface-item">
                    <label for="operationLength">How many numbers?</label>
                    <select class="operationLength form-element ${Configuration.noTouchClass}">`;
                for (const length of MathModule.OPERATION_LENGTHS) {
                    html += (this.module.operationLength === length) ?
                        `<option selected="selected">${length}</option>`
                        : `<option>${length}</option>`;
                    };
            html += `</select>
                </div>`;        // end of operation length choice

        // current score
        html += `<div class="interface-item-score"> 
                    <div>Your Score:</div>
                    <div>
                        <div class="score">0</div>
                        <div>/</div>
                        <div>${this.module.exercisesCount}</div>
                    </div>
                </div>
            </div>`;            // end of interface
        
        return html;
    }

    public static createMainContainer(module: MathModule, isTest: boolean): string {

        let isFraction: boolean = module.operandTypes.includes("fractions"),
            operation: OperationElement[],
            answerIdx: number,
            html: string;

        html = `<div class="columns">`
        for (let i=0; i<module.numbersBank.length; i++) {
            operation = module.numbersBank[i];
            answerIdx = module.answersMap.get(i);
            html +=                                     // beginning of single operation line
                `<div class="columns-line tooltip">
                    <span class="tiptext"></span>
                    <span class="columns-line-operation${(isFraction)? ' fraction-line': ''}">`;
            for (let j=0; j<operation.length; j++) {
                html += (j === answerIdx)?
                    operation[j].getLayout(true)
                    : operation[j].getLayout(false)
            }
            html += `<img src="${Configuration.ICON_QUESTION}" class="icon">`
            html += !isTest?
                    `<button type="submit" class="check button3d form-element ${Configuration.noTouchClass}">
                        check</button>`
                : '';
            html += `</span>
                </div>`                                 // end of single operation line
        }                                              
        html += '</div>';
        return html;
    }

    private createButtonsContainer(): string {
        let html =          //bottom button group
            `<div class="interface-buttons">`;
        html += (screen.width > 720)? 
                `<button type="reset" class="reset button3d form-element ${Configuration.noTouchClass}">
                    Reset</button>`
                :'';
        html += `<button type="submit" class="reload button3d form-element ${Configuration.noTouchClass}">
                    Reload</button>
                <button type="submit" class="check-all button3d form-element ${Configuration.noTouchClass}">
                    Check All</button>
            </div>`;    // end of button group
        return html;
    }


    
}

class ExerciseConfig {

    private levelInput: JQuery;
    private exercisesCountInput: JQuery;
    private operationLengthInput: JQuery;

    private namespace: string;
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
        this.namespace = `maths.${namespace}`;
        this.level_ns = `${this.namespace}.level`;
        this.exercicesCount_ns = `${this.namespace}.exercisesCount`;
        this.operationLength_ns = `${this.namespace}.operationLength`;
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
                    console.log("saving: " + namespace + ": " + newValue); /** */
                } else {
                    let loaded = localStorage.getItem(namespace);
                    console.log("loading: " + namespace + ": " + loaded);   //** */
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