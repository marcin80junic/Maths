import $ from 'jquery';
import { Container } from './container';
import { Configuration } from "../config/configuration";
import { ExerciseConfig } from '../config/exerciseConfig';
import { ExerciseLayoutCreator } from '../layout/exerciseLayoutCreator';
import { ContainerHandler } from '../handler/containerHandler';
import { ExerciseContainerHandler } from '../handler/exerciseHandler';
import { MathModule } from "../maths/mathModule";


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

    constructor(container: JQuery, content: MathModule, localConfig: ExerciseConfig) {
        super(container);
        this.module = content;
        this.setupGlobalConfig();
        this.localConfig = localConfig;
        this.updateLocalExercisesProps();
        this.createContainers();
        this.assignHandler();
        this.activateTooltips();
        this.localConfig.listen(this.interfaceContainer, () => this.updateLocalExercisesProps());
    }

    protected setupGlobalConfig() {
        this.globalConfig = Configuration.getConfig();
        this.globalConfig.addListener(Configuration.EVENT_CONTAINER, () => this.updateGlobalContainerProps());
        this.globalConfig.addListener(Configuration.EVENT_EXERCISE, () => this.configChanged = true);
        this.updateGlobalContainerProps();
        this.updateGlobalExercisesProps();
    }

    private updateLocalExercisesProps() {
        this.module.level = this.localConfig.getLevel();
        this.module.exercisesCount = this.localConfig.getExercisesCount();
        this.module.operationLength = this.localConfig.getOperationLength();
        this.module.init();
        if (this.maxScore) {
            this.maxScore.html(`${this.module.exercisesCount}`);
        }
        if (this.mainContainer) {
            this.reloadMainContainer();
        };
    }

    private createContainers(): void {
        let name = this.module.namespace.substring(this.module.namespace.lastIndexOf(".") + 1);
        this.formContainer = this.container.find(`#${name}-exercises`);
        this.interfaceContainer = $(ExerciseLayoutCreator.createInterfaceContainer(this.module));
        this.mainContainer = 
            $('<div class="mainContainer"></div>')
            .html(ExerciseLayoutCreator.createMainContainer(this.module, false));
        this.buttonContainer = $(ExerciseLayoutCreator.createButtonsContainer());
        this.formContainer.append(this.interfaceContainer, this.mainContainer, this.buttonContainer);
        this.maxScore = this.interfaceContainer.find('#score-max');
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

    private updateGlobalContainerProps() {
        this.showTooltips = this.globalConfig.general_tooltips;
    }

    protected updateGlobalExercisesProps() {
        this.module.randomize = this.globalConfig.general_randomize;
        this.module.init();
    }

    private reloadMainContainer() {
        this.mainContainer.html(ExerciseLayoutCreator.createMainContainer(this.module, false));
        this.assignHandler();
        this.activateTooltips();
    }
    
    show() {
        if (this.configChanged) {
            this.updateGlobalExercisesProps();
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
