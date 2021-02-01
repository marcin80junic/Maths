import $ from 'jquery';
import { Configuration } from '../config/configuration';
import { MathModule } from '../maths/mathModule';
import { AbstractExerciseHandler } from './exerciseHandlerAbstract';


export class ExerciseContainerHandler extends AbstractExerciseHandler {
    
    private scoreboard: JQuery;
    private buttons_check: JQuery;
    private button_reset: JQuery;
    private button_reload: JQuery;
    private button_submit: JQuery;

    constructor(container: JQuery<HTMLElement>, module: MathModule) {
        super(container, module);
        this.scoreboard = container.find("#score");
        this.buttons_check = container.find(".check");
        this.button_reset = container.find(".reset");
        this.button_reload = container.find(".reload");
        this.button_submit = container.find(".check-all");
    }

    handleContent(callback: Function): void {
        /* listeners for all check buttons on page */
        this.buttons_check.on("click", (event) => { 
            let index = this.buttons_check.index(event.target),
                isCorrect = this.processOperation(index);
            this.player.playSound(isCorrect);
            $(this).trigger('blur');
            event.preventDefault();
        });
        this.button_reset.on("click", () => {               
            this.module.resetScore();                                   // reset the score
            this.scoreboard.text(this.module.getScore());               // and scoreboard
            this.input_fields                                           // reset answers
                .removeClass("warning")                                     // remove red border if any
                .filter(':hidden')                                          // filter only answered ones
                .show()                                                     // put them back on the screen
                .next()                                                     // next element is an answer..
                .remove();                                                  // ..to be removed
            this.icons.prop("src", Configuration.ICON_QUESTION);        // reset icons
            this.buttons_check.removeClass("invisible");                // reset buttons
            this.icons.removeClass("answered");                         // remove extra margin
            this.button_reset.trigger('blur');                          // remove focus from button
        });
        this.button_reload.on("click", (e) => {   //reload button
            e.preventDefault();
            e.stopImmediatePropagation();
            this.module.init();
            callback();
        });
        this.button_submit.on("click", (e) => {
            e.preventDefault();
            this.buttons_check.each((index, btn) => {
                if (!$(btn).is(".invisible")) {
                    this.processOperation(index);
                }
            });
            this.button_submit.trigger('blur');
        });
        this.textInputHandlers(this.rows, (index: number) => this.buttons_check.eq(index).trigger('click'));  
    }

    processOperation(index: number): boolean {
        const isCorrect = super.processOperation(index),
            check_button = this.buttons_check.eq(index);

        if (isCorrect) {
            this.scoreboard.text(this.module.incrementAndGetScore());   // adjust the scoreboard
            check_button.addClass("invisible");                         // hide the check button
        }
        return isCorrect;
    }

}