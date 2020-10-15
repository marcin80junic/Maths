
import $ from 'jquery';
import { MathOperation } from './m01-prototype';
import { maths } from './m03-maths';


export const handlers = {

    exercises: function (module: MathOperation) {
        let 
            showTooltips = (maths.settings.general.showTooltips === "true"),
            
            timeout: any = null;                        // tooltip display delay
        

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

        this.textInputs(rows, answerFields, processOperation);  // add input fields filtering
    },


    test: function (container: JQuery) {
        const rows = container.find(".columns-line-operation"),
            answerFields = container.find(".answer"),
            prevBtn = container.find('.button-prev'),
            nextBtn = container.find('.button-next'),
            startBtn = container.find('.button-start'),
            finishBtn = container.find('.button-finish'),
            headers = container.find('.accordion-header'),
            closeBtn = maths.accordion.closeBtn,
            closeBtn2 = $("#test-close"),
            lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2),

            processTest = function () {
                let module = maths.test.modules[0],
                    moduleIndex: number,
                    answerIdx: number,
                    fields: JQuery,
                    result: any,
                    isCorrect: boolean;
                const icons = container.find(".icon"),
                    questPerModule = maths.test.numOfQuest,
                    totalQuestions = maths.test.modules.length * questPerModule,    
                    wrongAnswer = function (index: number) {
                        rows.eq(index).find(".answer").addClass("warning"); // find all answer fields in a line
                        icons.eq(index).prop("src", maths.icons.cross);
                    },
                    correctAnswer = function (index: number) {
                        module.score += 1;
                        rows.eq(index).find(".answer").addClass("correct");
                        icons.eq(index).prop("src", maths.icons.tick);
                    };
                rows.each(function (idx: number, row: HTMLElement) {
                    moduleIndex = idx % questPerModule;
                    if (moduleIndex === 0) {
                        module = maths.test.modules[idx/questPerModule];
                    }
                    fields = $(row).find(".answer"),
                    answerIdx = module.answersMap.get(moduleIndex);
                    result = module.numbersBank[moduleIndex][answerIdx];
                    isCorrect = maths.handlers.validateOperation(fields, result);
                    if (isCorrect) {
                        correctAnswer(idx);
                    } else {
                        wrongAnswer(idx);
                    }
                });
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
            processTest();
            answerFields.prop("disabled", "true");
            $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
            maths.test.displayResults(maths.timer.stop());
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
        

    

};