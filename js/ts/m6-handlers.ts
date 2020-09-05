
maths.handlers = {

    exercises: function (module: Operation) {
        let levelChoice = module.container.find(".level"),
            exerciseNumChoice = module.container.find(".exerciseNum"),
            scoreField = module.container.find(".score"),
            score = 0,
            rows = module.container.find(".columns-line"),
            tooltips = rows.find(".tooltip"),
            showTooltips = (maths.settings.general.showTooltips === "true"),
            answerFields = rows.find(".answer"),
            icons = rows.find(".icon"),
            checkButtons = rows.find(".check"),
            resetButton = module.container.find(".reset"),
            reloadButton = module.container.find(".reload"),
            checkAllButton = module.container.find(".check-all"),
            answerField: JQuery,
            icon: JQuery,
            checkBtn: JQuery,
            result: number | Array<number>, // result of a single operation
            answers: Array<number>,     // user's answers
            timeout: number = null;   // tooltip display delay
        const goodAnswer = function () {
            scoreField.text(++score);
            answerField.each(function (idx) {
                let className = $(this).parents().is('.fraction-unit')? "": "close";
                $(this).hide().after('<span class="' + className + '">' + answers[idx] + '</span>');
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
                answerField = rows.eq(index).find(".answer");
                icon = icons.eq(index);
                checkBtn = checkButtons.eq(index);
                result = module.results[index];
                answers = [];
                let isCorrect = maths.handlers.validateOperation(answerField, result, answers);
                return isCorrect ? goodAnswer() : wrongAnswer();
            };

        $(document).ready(()=> this.adjustLinesPadding(rows));    //adjust padding

        levelChoice.on("change", function () {    //options change
            let name = $(this).find("option:selected").text();
            module.setLevel(maths.difficulties.indexOf(name));
        });
        exerciseNumChoice.on("change", function () {
            let number = $(this).find("option:selected").text();
            module.setExerciseNum(parseInt(number, 10));
        });

        tooltips.on("mouseover mouseout", function (e) {
            if (showTooltips) {       
                let tip = $(this).find(".tiptext"),
                    idx = tooltips.index(this);
                if (e.type === "mouseover") {   // position tooltip by setting its margin-left property
                    let el_center = $(this).width() / 2,    // find 'tooltip' wrapper center
                        tip_center: number;
                    timeout = setTimeout(function () {
                        if (tip.children().length === 0) {
                            maths.createAndAppendCanvas(tip, module, idx);  // create tiptext content
                            tip_center = tip.width() / 2,   // find tiptext center
                            tip.css('marginLeft', el_center - (tip_center + 11) + "px");
                        }
                        tip.addClass("showtip");
                    }, 1200);
                } else {
                    if (timeout !== null) {
                        clearTimeout(timeout);
                    }
                    tip.removeClass("showtip");
                }
            }
        });

        checkButtons.on("click", function (e) {   //listeners for all check buttons on page
            e.preventDefault();
            let index = checkButtons.index(this),
                isCorrect = processOperation(index);
            maths.playSound(isCorrect);
            $(this).blur();
        });

        resetButton.on("click", () => {    //reset button
            score = 0;
            scoreField.text(score);
            answerFields.show().removeClass("warning").next().remove();
            icons.prop("src", maths.icons.questMark);
            checkButtons.removeClass("invisible");
            resetButton.blur();
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
            checkAllButton.blur();
        });

        this.textInputs(rows, answerFields, processOperation);  //add input fields filtering
    },

    test: function (module: Operation) {
        let rows = module.container.find(".columns-line"),
            answerFields = module.container.find(".answer"),
            prevBtn = module.container.find('.button-prev'),
            nextBtn = module.container.find('.button-next'),
            startBtn = module.container.find('.button-start'),
            finishBtn = module.container.find('.button-finish'),
            headers = module.container.find('.test-accordeon-section-header'),
            closeBtn = maths.accordion.closeBtn,
            closeBtn2 = $("#test-close"),
            lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2);
        const processTest = function () {
            let scores: Array<number> = [],
                icons = module.container.find(".icon"),
                results = module.results;
            const wrongAnswer = function (index: number) {
                scores[index] = 0;
                rows.eq(index).find(".answer").addClass("warning");
                icons.eq(index).prop("src", maths.icons.cross);
            };
            const correctAnswer = function (index: number) {
                scores[index] = 1;
                rows.eq(index).find(".answer").addClass("correct");
                icons.eq(index).prop("src", maths.icons.tick);
            };
            rows.each(function (idx, row) {
                let fields = $(row).find(".answer"),
                    result = module.results[idx],
                    isCorrect = maths.handlers.validateOperation(fields, result);
                if (isCorrect) {
                    correctAnswer(idx);
                } else {
                    wrongAnswer(idx);
                }
            });
            return scores;
        };

        $(document).ready(()=> this.adjustLinesPadding(rows));    //adjust padding

        startBtn.on("click", function () {
            if ($(this).text() === "Start") {
                let ns = maths.test;
                maths.timer.init($('.test-accordeon-titlebar-foo'), ns.times[ns.level], ns.summary);
                maths.accordion.attachListeners();
                $(this).text("Next");
            }
            maths.accordion.show(headers.eq(1), 1);
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

        closeBtn2.on("click", () => maths.accordion.dispose());

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
        answerFields.on("blur", function () {
            let field = $(this);
            if (field.val() === "") {
                let parent = field.removeClass("warning").parents(".columns-line");
                let fields = parent.find(".answer");
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
                row = field.parents(".columns-line"),
                index = rows.index(row),
                isFraction = row.find(".answer").length > 1,
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

    adjustLinesPadding: function($lines: JQuery) {
        let width = $lines[0].getBoundingClientRect().width,     // line's width (equal for all lines)
            max = 0,    // the longest line
            min = width,    // the shortest line
            padding: number;
        
        Array.prototype.forEach.call($lines, function (line: HTMLElement) {
            let children = line.children,
                sum = 0,   // length of all child elements in pixels
                style,
                margin: string;
        
            Array.prototype.forEach.call(children, function (child: any) {
                style = window.getComputedStyle(child) || child.currentStyle;
                margin = style.marginLeft;
                sum += parseInt(margin.substring(0, margin.indexOf('px')), 10) + 2;
                sum += child.getBoundingClientRect().width;
            });
            min = (sum < min) ? sum : min;
            max = (sum > max) ? sum : max;
        });
        padding = (width - ((max + min) / 2)) / 2;  // padding based on average line width
        padding = (padding > (width - max)) ? (width - max) / 2 : padding;  // adjust it if max is too long
        Array.prototype.forEach.call($lines, function (line: HTMLElement) {
            line.style.paddingRight = padding + 'px';
        });
    }

};