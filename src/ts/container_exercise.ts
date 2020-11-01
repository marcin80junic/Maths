import $ from 'jquery';
import { MathModule, MathModuleBuilder } from "./module_math";
import { AbstractContainerFactory, Container } from "./container_home";
import { Operator } from './operator_abstract';
import { OperatorFactory } from './operator_factory';
import { Operand } from './operand_abstract';
import { Configuration } from "./module_config";
import { LayoutCreator } from './container_layout';
import { ContainerHandler, ExerciseContainerHandler } from './container_handlers';



export class AdditionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("addition")
            .setNamespace(Configuration.ADDITION)
            .setOparators(OperatorFactory.obtainOperator(Operator.ADDITION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class SubtractionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("subtraction")
            .setNamespace(Configuration.SUBTRACTION)
            .setOparators(OperatorFactory.obtainOperator(Operator.SUBTRACTION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class MultiplicationContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("multiplication")
            .setNamespace(Configuration.MULTIPLICATION)
            .setOparators(OperatorFactory.obtainOperator(Operator.MULTIPLICATION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class DivisionContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery): Container {
        const builder = new MathModuleBuilder();
        builder
            .setName("division")
            .setNamespace(Configuration.DIVISION)
            .setOparators(OperatorFactory.obtainOperator(Operator.DIVISION_OPERATOR))
            .setOperands(Operand.INTEGER_OPERAND);
        return new ExerciseContainer(container, builder.build());
    }
}

export class FractionsContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.fractions_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("fractions")
            .setNamespace(Configuration.FRACTIONS)
            .setOparators(...operators)
            .setOperands(Operand.FRACTION_OPERAND);
        return new FractionContainer(container, builder.build());
    }
}

export class CustomContainerFactory implements AbstractContainerFactory {
    createContainer(container: JQuery, config: Configuration): Container {
        const builder = new MathModuleBuilder(),
              operators: Operator[] = [];
            
        for (const operator of config.custom_operators) {
            operators.push(OperatorFactory.obtainOperator(operator));
        }
        builder
            .setName("custom")
            .setNamespace(Configuration.CUSTOM)
            .setOparators(...operators)
            .setOperands(Operand.INTEGER_OPERAND, Operand.FRACTION_OPERAND, Operand.COMPOSITE_OPERAND);
        return new CustomContainer(container, builder.build());
    }
}


class ExerciseContainer extends Container {
    
    protected globalConfig: Configuration;
    protected localConfig: ExerciseConfig;
    protected module: MathModule;
    protected handler: ContainerHandler;
    protected configChanged: boolean;
    protected showTooltips: boolean;

    protected formContainer: JQuery;
    protected interfaceContainer: JQuery;
    protected mainContainer: JQuery;
    protected buttonContainer: JQuery;

    constructor(container: JQuery, content: MathModule) {
        super(container);
        this.module = content;
        this.getGlobalConfig();
        this.getLocalConfig();
        this.createContainers();
        this.localConfig.listen(this.interfaceContainer);
        this.handler = new ExerciseContainerHandler(this.formContainer, this.module);
        this.handler.handleContent(() => this.reloadMainContainer());
        this.activateTooltips();
    }

    protected getGlobalConfig() {
        this.globalConfig = Configuration.getConfig();
        this.globalConfig.addListener(Configuration.EVENT_CONTAINER, () => this.updateContainerProps());
        this.globalConfig.addListener(Configuration.EVENT_EXERCISE, () => this.configChanged = true);
        this.updateContainerProps();
        this.updateExercisesProps();
    }

    private getLocalConfig() {
        this.localConfig = new ExerciseConfig(this.module.namespace, () => this.updateLocalProps());
        this.updateLocalProps();
    }

    private createContainers(): void {
        let name = this.module.namespace.substring(this.module.namespace.lastIndexOf(".") + 1);
        this.formContainer = this.container.find(`#${name}-exercises`);
        this.interfaceContainer = $(LayoutCreator.createInterfaceContainer(this.module));
        this.mainContainer = 
            $('<div class="mainContainer"></div>')
            .html(LayoutCreator.createMainContainer(this.module, false));
        this.buttonContainer = $(LayoutCreator.createButtonsContainer());
        this.formContainer.append(this.interfaceContainer, this.mainContainer, this.buttonContainer);
    }

    private updateContainerProps() {
        this.showTooltips = this.globalConfig.general_tooltips;
        if (this.mainContainer) {
            this.activateTooltips();
        }
    }

    protected updateExercisesProps() {
        this.module.randomize = this.globalConfig.general_randomize;
    }

    protected updateOperators(array: string[]) {
        this.module.operators = [];
        for (const operator of array) {
            this.module.operators.push(OperatorFactory.obtainOperator(operator));
        }
    }

    private updateLocalProps() {
        this.module.level = this.localConfig.level;
        this.module.exercisesCount = this.localConfig.exercisesCount;
        this.module.operationLength = this.localConfig.operationLength;
        this.module.init();
        if (this.mainContainer) {
            this.reloadMainContainer();
        };
    }

    private reloadMainContainer() {
        this.mainContainer.html(LayoutCreator.createMainContainer(this.module, false));
        this.handler = new ExerciseContainerHandler(this.formContainer, this.module);
        this.handler.handleContent(() => this.reloadMainContainer());
        this.activateTooltips();
    }
    
    show() {
        if (this.configChanged) {
            this.updateExercisesProps();
            this.module.init();
            this.reloadMainContainer();
            this.configChanged = false;
        }
        super.show();
    }

    hide(callback: Function) {
        super.hide(callback)
    }

    displayTooltip(element: JQuery): boolean {
        const tip = element.prev(),                                 // tooltip 'body' is a previous sibling
            rows = this.mainContainer.find('.tooltip')
        let margin: number,
            idx: number;

        if (tip.children().length === 0) {                          // if tooltip was not created before
            idx = rows.index(element);                              // find index of operation
                // create tiptext content
            margin = (tip.parent().width() - tip.outerWidth()) / 2; // calculate left margin..
            tip.css('marginLeft', `${margin}px`);                   // ..needed to center the tooltip
        }
        tip.addClass("showtip");                                    // display tooltip
        return true;
    }

    private activateTooltips() {
        let timeout = null;
        
        if (Configuration.isTouchscreen) {                  // for touchscreen display tooltip on icon 'tap'
            this.mainContainer.find('.icon').on('click', (e) => {
                if (!this.showTooltips) {
                    return false;
                }
                $('.showtip').removeClass('showtip');
                this.displayTooltip($(e.target).parent());  // operation's row is a direct parent of icon
                e.stopPropagation();                        // prevent body's handler to hide this tooltip
            });
        } else {
            this.mainContainer.find('.answer').on("mouseover mouseout", (e) => {
                if (!this.showTooltips) {
                    return false;
                }
                if (e.type === "mouseover") {               // find operation's row and pass it to showtip
                    timeout = setTimeout(
                        () => this.displayTooltip($(e.target).parents('.columns-line-operation')
                    ), 1200);
                } else {
                    if (timeout !== null) {
                        clearTimeout(timeout);
                    }
                    $('.showtip').removeClass('showtip');
                }
            });
        }
    }
  
}

class FractionContainer extends ExerciseContainer {
    
    constructor(container: JQuery, content: MathModule) {
        super(container, content);
    }

    protected getGlobalConfig() {
        super.getGlobalConfig();
        this.globalConfig.addListener(Configuration.EVENT_FRACTIONS, () => this.configChanged = true);
    }
    protected updateExercisesProps() {
        super.updateExercisesProps();
        this.updateOperators(this.globalConfig.fractions_operators);
    }

}

class CustomContainer extends ExerciseContainer {
    
    constructor(container: JQuery, content: MathModule) {
        super(container, content);
    }

    protected getGlobalConfig() {
        super.getGlobalConfig();
        this.globalConfig.addListener(Configuration.EVENT_CUSTOM, () => this.configChanged = true);
    }
    protected updateExercisesProps() {
        super.updateExercisesProps();
        this.updateOperators(this.globalConfig.custom_operators);
    }

}


class ExerciseConfig {

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