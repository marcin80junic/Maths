import $ from 'jquery';
import { MathModule } from "./module_math";
import { Container } from "./container_home";
import { OperatorFactory } from './operator_factory';
import { Configuration } from "./module_config";
import { LayoutCreator } from './container_layout';
import { ContainerHandler, ExerciseContainerHandler } from './container_handlers';
import { ExerciseConfig } from './container_config';


export class ExerciseContainer extends Container {
    
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

    protected maxScore: JQuery;

    constructor(container: JQuery, content: MathModule) {
        super(container);
        this.module = content;
        this.getGlobalConfig();
        this.getLocalConfig();
        this.createContainers();
        this.localConfig.listen(this.interfaceContainer);
        this.assignHandler();
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
        this.maxScore = this.interfaceContainer.find('#score-max');
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
        if (this.maxScore) {
            this.maxScore.html(`${this.module.exercisesCount}`);
        }
        if (this.mainContainer) {
            this.reloadMainContainer();
        };
    }

    private reloadMainContainer() {
        this.mainContainer.html(LayoutCreator.createMainContainer(this.module, false));
        this.assignHandler();
        this.activateTooltips();
    }

    private assignHandler() {
        this.handler = new ExerciseContainerHandler(this.formContainer, this.module);
        this.handler.handleContent(
            () => {
                this.reloadMainContainer();
                this.formContainer.attr("data-loaded", "true");     // triggers lines length adjustment
            }
        );
    }
    
    show() {
        if (this.configChanged) {
            this.updateExercisesProps();
            this.module.init();
            this.reloadMainContainer();
            this.configChanged = false;
        }
        super.show();
        if (!this.formContainer.is('[data-loaded]')) {
            this.formContainer.attr("data-loaded", "true");    // only triggers when first displayed
        }
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


export class FractionContainer extends ExerciseContainer {
    
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


export class CustomContainer extends ExerciseContainer {
    
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