import $ from 'jquery';
import { Container } from "./container";
import { ContainerHandler } from "../handler/containerHandler";
import { Configuration } from "../config/configuration";
import { TestCreator } from '../handler/testCreator';


export class TestContainer extends Container {

    private config: Configuration;
    private levelButtons: JQuery;
    private unlocked: number;


    constructor (container: JQuery, buttonHandler: ContainerHandler) {
        super(container);
        this.config = Configuration.getConfig();
        this.config.addListener(
            Configuration.EVENT_TEST,
            () => this.init()
        );
        buttonHandler.handleContent(
            (level: number) => TestCreator.getTestCreator().createTest(level)
        );
        this.levelButtons = container.find('.test-level-choice');
        this.init()
    }

    private init () {
        this.unlocked = this.config.test_unlocked;
        this.updateLevelButtons();
    }

    private updateLevelButtons () {
        this.levelButtons.each(
            (index, button) => {
                if (index <= this.unlocked) {
                    $(button).prop('disabled', false);
                } else {
                    $(button).prop('disabled', true);
                }
            }
        );
    }


    displayTooltip (): boolean {
        return false;
    }

}