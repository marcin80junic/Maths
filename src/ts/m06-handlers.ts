
import $ from 'jquery';
import { MathOperation } from './m01-prototype';



export const handlers = {


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

    
};