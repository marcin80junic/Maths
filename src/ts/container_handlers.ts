import $ from 'jquery';
import { Configuration, MediaPlayback } from "./module_config";
import { MathModule } from "./module_math";


export abstract class ContainerHandler {

    protected rows: JQuery;
    protected input_fields: JQuery;
    protected icons: JQuery;
    protected module: MathModule;
    protected player: MediaPlayback;

    constructor (container: JQuery<HTMLElement>, module: MathModule) {
        this.rows = container.find(".columns-line-operation");
        this.input_fields = this.rows.find(".answer");
        this.icons = this.rows.find('.icon');
        this.module = module;
        this.player = MediaPlayback.getPlayer();
    }

    abstract handleContent(callback?: Function): void;

    protected processOperation(index: number): boolean {
        const answerIdx = this.module.answersMap.get(index),
            result = this.module.numbersBank[index][answerIdx].value(),   
            answer_inputs = this.rows.eq(index).find(".answer"),
            answers = this.collectAnswers(answer_inputs),
            isCorrect = (result instanceof Array)?
                this.compareFractions(answers, <number[]>result)
                : result === answers[0],
            icon = this.icons.eq(index);
       
        if (isCorrect) {
            answer_inputs.each(function (idx: number) {                 // hide text input and display answer
                $(this).hide().after(`<div>${(answers[idx] === 0)? '': answers[idx]}</div>`);     
            });
            icon.prop("src", Configuration.ICON_TICK)                   // change icon to `tick`
                .addClass("answered");                                  // add some left margin to it
        } else {
            answer_inputs.addClass("warning");                          // add red border to input fields
            icon.prop("src", Configuration.ICON_CROSS);                 // change icon to red cross
        }
        return isCorrect;
    }

    private collectAnswers(inputs: JQuery): number[] {
        const answers: number[] = [];
        let answer: string;
        inputs.each(function (idx) {                        // collect answer(s) and check if they're not empty
            answer = <string>$(this).val();
            answers.push(
                (answer === "")? 0: parseInt(answer)        // assume 0 if input is empty
            );
        });
        return answers;
    };
    
    private compareFractions(answers: number[], results: number[]): boolean {
        if (answers.length === 1) {
            answers = [answers[0], 1];
        }
        if (answers.length === 3) {
            answers = [answers[0] * answers[2] + answers[1], answers[2]];
        }
        return answers[0] / answers[1] === results[0] / results[1];
    }

    protected textInputHandlers(parents: JQuery, callback?: Function) {
        this.input_fields.on("paste", () => false);
        this.input_fields.on("click", function() {
            (<HTMLInputElement>this).select();
        });
        this.input_fields.on("blur", function () {
            let field = $(this);
            if (field.val() === "") {
                let parent = field.removeClass("warning").parents(".columns-line-operation");
                let fields = parent.find(".answer").removeClass("warning");
                if (fields.length > 1) {  // only if a fraction
                    if (fields.not(field).val() !== "") {
                        return;
                    }
                }
                parent.find(".icon").prop("src", Configuration.ICON_QUESTION);
            }
        });
        this.input_fields.on("keydown", function (e) {
            const field = $(this),
                row = field.parents(".columns-line-operation"),
                index = parents.index(row),
                isFraction = row.find(".fraction").length > 0,
                length = (<string>field.val()).length,
                limit = isFraction? 2: 3,
                char = e.key,
                allowedNums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                allowedKeys = ["ArrowLeft", "ArrowRight", "Backspace", "Delete", "Tab", "Enter"];

            if (allowedNums.includes(char)) {
                if (length < limit || window.getSelection().toString() !== "") {
                    return true;
                }
            }
            if (allowedKeys.includes(char)) {
                if (char === "Enter" && typeof callback === "function") {   // if enter pressed
                    callback(index);                                        // check operation
                    return false;                                           // and stop propagation
                }
                return true;
            }
            return false;
        });
    }

    protected adjustLinesLength($lines: JQuery): void {
        let max = 0,
            width: number;
        $lines.each(function(idx) {
            width = $(this).width();
            max = (width > max)? width: max;
        });
        $lines.each(function() {
            $(this).width(max - 5);
        });
    }

}


export class ExerciseContainerHandler extends ContainerHandler {
    
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
                .next()                                                     // next element is an answer
                .remove();                                                  // to be removed
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
        /* run it as soon as page is loaded */
        /* to be replaced by mutation observer */
        setTimeout(() => this.adjustLinesLength(this.rows), 500);
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


export class TestContainerHandler extends ContainerHandler {

    private constructor(container: JQuery<HTMLElement>, module: MathModule) {
        super(container, module);
    }

    handleContent(): void {
        throw new Error("Method not implemented.");
    }
    
}