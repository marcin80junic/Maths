
import $ from 'jquery';
import { MathOperation } from './m01-prototype';
import { maths } from './m02-maths';


export const handlers = {

    exercises: function (module: MathOperation) {
        let levelChoice = module.container.find(".level"),
            exerciseNumChoice = module.container.find(".exerciseNum"),
            scoreField = module.container.find(".score"),
            score = 0,
            rows = module.container.find(".columns-line-operation"),
            showTooltips = (maths.settings.general.showTooltips === "true"),
            answerFields = rows.find(".answer"),
            icons = rows.find(".icon"),
            checkButtons = rows.find(".check"),
            resetButton = module.container.find(".reset"),
            reloadButton = module.container.find(".reload"),
            checkAllButton = module.container.find(".check-all"),
            answerField: JQuery,                        // text field or fields currently checked
            icon: JQuery,                               // icon of the line being checked
            checkBtn: JQuery,                           // currently pressed check button
            result: number | Array<number>,             // result of a single operation
            answers: Array<number>,                     // user's answers
            timeout: any = null;                        // tooltip display delay
        
        const goodAnswer = function () {
                scoreField.text(++score);           // adjust the score
                answerField.each(function (idx) {   // each text field to be replaced by given correct answer
                    $(this).hide().after(`<div> ${ answers[idx] } </div>`); // hide text input and display answer
                    icon.addClass("answered");                  // add some left margin to `tick` icon
                });
                icon.prop("src", maths.icons.tick);
                checkBtn.addClass("invisible");
                return true;
                },
            wrongAnswer = function () {
                icon.prop("src", maths.icons.cross);
                answerField.addClass("warning");
                return false;
            },
            processOperation = function (index: number) {
                const answerIdx = module.answersMap.get(index);
                let isCorrect: boolean;

                answerField = rows.eq(index).find(".answer");
                icon = icons.eq(index);
                checkBtn = checkButtons.eq(index);
                result = module.numbersBank[index][answerIdx];
                answers = [];
                isCorrect = maths.handlers.validateOperation(answerField, result, answers);
                return isCorrect ? goodAnswer(): wrongAnswer();
            };

        levelChoice.on("change", function () {                      // options change
            let name = $(this).find("option:selected").text();
            module.level = maths.difficulties.indexOf(name);
        });
        exerciseNumChoice.on("change", function () {
            let number = $(this).find("option:selected").text();
            module.exercisesCount = parseInt(number, 10);
        });

        const showTip = (row: JQuery) => {
            let tip = row.prev(),                                   // tooltip 'body' is a previous sibling
                margin: number,
                idx: number;
            if (tip.children().length === 0) {
                idx = rows.index(row);                                  // find index of operation
                maths.createAndAppendCanvas(tip, module, idx);          // create tiptext content
                margin = (tip.parent().width() - tip.outerWidth()) / 2; // calculate left margin..
                tip.css('marginLeft', `${margin}px`);                   // ..needed to center the tooltip
            }
            tip.addClass("showtip");
        }

        answerFields.on("mouseover mouseout", function (e) {
            if (maths.isTouchscreen) return;                // don't display tooltips on touchscreen devices    
            if (showTooltips) { 
                if (e.type === "mouseover") {               // find operation's row and pass it to showtip
                    timeout = setTimeout(() => showTip($(this).parents('.columns-line-operation')), 1200);
                } else {
                    if (timeout !== null) {
                        clearTimeout(timeout);
                    }
                    $('.showtip').removeClass('showtip');
                }
            }
        });
        if(maths.isTouchscreen) {                       // for touchscreen display tooltip on icon 'tap'
            icons.on('click', function(event) {
                $('.showtip').removeClass('showtip');
                showTip($(this).parent());              // operation's row is a direct parent of icon
                event.stopPropagation();                // prevent body's handler to hide this tooltip
            });
        }

        checkButtons.on("click", function (e) {         // listeners for all check buttons on page
            e.preventDefault();
            let index = checkButtons.index(this),
                isCorrect = processOperation(index);
            maths.playSound(isCorrect);
            $(this).trigger('blur');
        });

        resetButton.on("click", () => {                                     // reset button
            score = 0;
            scoreField.text(score);                                         // reset the score
            answerFields.show().removeClass("warning").next().remove();     // reset answers
            icons.prop("src", maths.icons.questMark);                       // reset icons
            checkButtons.removeClass("invisible");                          // reset buttons
            icons.removeClass("answered");                                  // remove extra margin
            resetButton.trigger('blur');
        });

        reloadButton.on("click", (e) => {   //reload button
            e.preventDefault();
            module.init();
        });

        checkAllButton.on("click", (e) => {
            e.preventDefault();
            checkButtons.each(function (index, btn) {
                if (!$(btn).is(".invisible")) {
                    processOperation(index);
                }
            });
            checkAllButton.trigger('blur');
        });
        setTimeout(()=>this.adjustLinesLength(rows), 1);        // run it as soon as page is loaded
        this.textInputs(rows, answerFields, processOperation);  // add input fields filtering
    },


    test: function (container: JQuery) {
        let rows = container.find(".columns-line-operation"),
            answerFields = container.find(".answer"),
            prevBtn = container.find('.button-prev'),
            nextBtn = container.find('.button-next'),
            startBtn = container.find('.button-start'),
            finishBtn = container.find('.button-finish'),
            headers = container.find('.accordion-header'),
            closeBtn = maths.accordion.closeBtn,
            closeBtn2 = $("#test-close"),
            lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2);
        const processTest = function () {
            let scores: Array<number> = [],
                icons = container.find(".icon"),
                results = maths.test.results;
            const wrongAnswer = function (index: number) {
                scores[index] = 0;
                rows.eq(index).find(".answer").addClass("warning"); // find all answer fields in a line
                icons.eq(index).prop("src", maths.icons.cross);
            };
            const correctAnswer = function (index: number) {
                scores[index] = 1;
                rows.eq(index).find(".answer").addClass("correct");
                icons.eq(index).prop("src", maths.icons.tick);
            };
            rows.each(function (idx: number, row: HTMLElement) {
                let fields = $(row).find(".answer"),
                    result = results[idx],
                    isCorrect = maths.handlers.validateOperation(fields, result);
                if (isCorrect) {
                    correctAnswer(idx);
                } else {
                    wrongAnswer(idx);
                }
            });
            return scores;
        };
        
        startBtn.on("click", function () {
            if (startBtn.text() === "Start") {
                $(this).text("Next");                       // change button text
                maths.accordion.start();                    // show first section
                maths.handlers.adjustLinesLength(rows);
                maths.timer.start(() => finishBtn.trigger('click'));
                return;
            }
            maths.accordion.show(headers.eq(1), 1);     // nextBtn behavior
        });

        prevBtn.on("click", function () {
            let index = prevBtn.index(this);
            maths.accordion.show(headers.eq(index), index);
        });

        nextBtn.on("click", function () {
            let index = nextBtn.index(this);
            maths.accordion.show(headers.eq(index + 2), index + 2);
        });

        finishBtn.on("click", function () {
            let scores = processTest();
            answerFields.prop("disabled", "true");
            $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
            maths.test.displayResults(scores, maths.timer.stop());
        });

        closeBtn2.on("click", () => maths.dialog.dispose(() => maths.accordion.dispose()));

        lastFocusableElements.on("keydown", function (e) { 
            if (e.which === 9) {    // keep focus traversing inside the dialog container
                if (e.shiftKey) {
                    if ($(this).is(closeBtn)) {
                        lastFocusableElements.filter(":visible").focus();
                        e.preventDefault();
                    }
                } else if (!$(this).is(closeBtn)) {
                    closeBtn.focus();
                    e.preventDefault();
                }
            }
        });

        this.textInputs(rows, answerFields);  // add input fields filtering
    },

    validateOperation: function (answerFields: JQuery, result: any, answers: any) {   //validates single operation
        let fraction = [],
            input: string;

        answers = answers || [];
        answerFields.each(function (idx) {  //collect answer(s) and check if they're not empty
            input = <string>$(this).val();
            if (input === "") {
                if (result.length && idx === 0 && result[0] > result[1]) {
                    input = "0";     // if no input in "whole" part of fraction assume zero
                } else {
                    return false;
                }
            }
            answers.push(parseInt(input, 10));
        });
        if (result.length) {  // if dealing with fractions convert answers to simple fractions
            if (answers.length === 1) {
                fraction = [answers[0], 1];
            }
            if (answers.length === 2) {
                fraction = answers;
            }
            if (answers.length === 3) {
                fraction = [answers[0] * answers[2] + answers[1], answers[2]];
                answers[0] = (answers[0] === 0) ? "" : answers[0];    // remove zero if there was one added
            }
        }
        if (fraction.length === 0) {  // if not a fraction
            return (answers[0] === result) ? true : false;
        } else {  // if a fraction
            return (fraction[0] / fraction[1] === result[0] / result[1]) ? true : false;
        }
    },

    textInputs: function (rows: JQuery, answerFields: JQuery, callback: any) { //input filtering for answer fields
        answerFields.on("paste", () => false);
        answerFields.on("click", function() {
            (<HTMLInputElement>this).select();
        });
        answerFields.on("blur", function () {
            let field = $(this);
            if (field.val() === "") {
                let parent = field.removeClass("warning").parents(".columns-line-operation");
                let fields = parent.find(".answer").removeClass("warning");
                if (fields.length > 1) {  // only if a fraction
                    if (fields.not(field).val() !== "") {
                        return;
                    }
                }
                parent.find(".icon").prop("src", maths.icons.questMark);
            }
        });
        answerFields.on("keydown", function (e) {
            let field = $(this),
                row = field.parents(".columns-line-operation"),
                index = rows.index(row),
                isFraction = row.find(".fraction").length > 0,
                char = String.fromCharCode(e.which),
                length = (<string>field.val()).length,
                limit = 3;
            if (isFraction) { // adjust variables if fraction
                limit = 2;
            }
            if ((window.getSelection().toString() !== "") && ($.isNumeric(char) ||
                (e.which > 95 && e.which < 106))) {
                return true; //allow replacing selection with numbers
            }
            if (e.which === 8 || e.which === 9 || e.which === 46 || e.which === 37 || e.which === 39) {
                return true; //allow backspace, tab, delete, left and right arrow
            }
            if ((e.which > 95) && (e.which < 106) && (length < limit)) {
                return true; //allow numeric keyboard
            }
            if (e.which === 13 && typeof callback === "function") {
                let isCorrect = callback(index); // check line when "enter" pressed
                maths.playSound(isCorrect);
                return false;
            }
            if (!$.isNumeric(char) || (length === limit)) {
                return false;
            }
        });
    },

    adjustLinesLength: function($lines: JQuery) {
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

};