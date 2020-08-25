
maths.layout = {

    exercises: function (module) {
        let num = module.exerciseNum,
            html = "";
        // user interface on top
        html += '<div class="interface">';

        // choice of level
        html += '<div class="interface-item"><label for="level">Difficulty:</label><select class="level">';
        maths.difficulties.forEach((item, index) => {
            html += (module.level === index) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of level

        // number of exercises choice
        html += '<div class="interface-item"><label for="exerciseNum">How many exercises?</label><select class="exerciseNum">';
        maths.numOfExercises.forEach((item, index) => {
            html += (module.exerciseNum === parseInt(item, 10)) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of num of exercises choice

        // current score
        html += '<div class="interface-item-score">'; 
        html += '<div>Your Score:</div>';
        html += '<div><div class="score">0</div>';
        html += '<div>/</div>';
        html += '<div>' + num + '</div>';
        html += '</div></div>';   // end of score
        html += '</div>'; // end of interface

        html += this.main(module, num); //add main content and assign results to module's results property

        //bottom button group
        html += '<div class="interface">';
        html += '<input type="reset" class="reset">';
        html += '<input type="submit" value="Reload" class="reload">';
        html += '<input type="submit" value="Check All" class="check-all">';
        html += '</div>';   // end of button group
        module.levelDisplayed = module.level;
        module.container.html(html);
    },

    main: function (module) {
        let allNumbers = module.numbers, // numbers bank
            length = allNumbers.length,
            numbers, index, perc, len, random, i, j, isFraction, isAnswer,
            sign = module.sign,
            isTest = module.name === "test",
            isRandomized = maths.settings.general.isRandomized === "true",
            results = module.results,
            html = '<div class="exercises">';
            
        for (i = 0; i < length; i += 1) {
            numbers = allNumbers[i];  // numbers for single operation
            len = numbers.length;
            if (isRandomized) { // if true randomize placement of answer field
                perc = 1 / len; // a chance for number to be an answer field
                random = Math.random();
                index = Math.floor(random / perc); // index of answer field
            } else {  // answer field on the right of equality sign
                index = len - 1; // index of answer field
            }
    
            // single operation
            html += '<div class="exercises-operation">';
            for (j = 0; j < len; j += 1) {
                isFraction = (numbers[j].length > 1);
                isAnswer = (j === index);
                if (isAnswer) {
                    module.answersIdxs.push(j);
                }
                html += isFraction?    // methods below return layout and assign number(s) to results array
                    this.fraction(numbers[j], isAnswer, results)
                    : this.integer(numbers[j], isAnswer, results);
                if (j === len - 1) {
                    break;
                }
                html += (j === len - 2) ?
                    '<div> = </div>'
                    : '<div>' + sign + '</div>';
            }
            html += '<img src="' + maths.icons.questMark + '" class="icon">';
            html += !isTest ?  // insert a check button if not a test
                '<input type="submit" value="check" class="check">' : "";
            html += '</div>';
        }   // end of single operation

        html += '</div>';
        return html;
    },

    integer: function (number, isAnswer, results) {
        let html = '';
        html += isAnswer ?
            '<div class="tooltip"><input type="text" maxlength="3" class="answer">' +
            '<span class="tiptext"></span></div>'
            : '<div>' + number + '</div>';
        if (isAnswer) {
            results.push(number);
        }
        return html;
    },

    fraction: function (array, isAnswer, results) {
        let number = array[0] / array[1],   // decimal representation of fraction
            wholeNum = Math.floor(number),  // whole part of a fraction
            isInteger = Number.isInteger(number),   // is fraction an integer?
            tempArray = [],
            html = '';

        html += isAnswer? '<span class="tooltip">': ''; // if it's an answer wrap fraction in a tooltip module
        html += '<div class="fraction">';   // opening fraction tag

        html += (wholeNum >= 1)?  // is there a whole number before a fraction part?
            isAnswer?
                '<div class="whole"><input type="text" maxlength="1" class="answer"></div>'
                : '<div class="whole">' + wholeNum + '</div>'
                : ''

        if (isInteger) {    // if fraction is an integer add closing tags and return
            html += '</div>';
            html += '<span class="tiptext"></span>';
            if (isAnswer) {
                html += '</span>';
                results.push(array);
            }
            return html;
        }

        // calculate what is left after taking the whole number
        tempArray = [array[0] - (wholeNum * array[1]), array[1]];
        
        html += '<div class="fraction-unit">';
        html += '<div class="numerator">';
        html += isAnswer?
            '<input type="text" class="answer" size="1">'
            : tempArray[0]
        html += '</div>';   // closing 'numerator' tag
        html += '<div class="denominator">';
        html += isAnswer?
            '<input type="text" class="answer" size="1">'
            : tempArray[1]
        html += '</div></div></div>'; // closing 'denominator', 'fraction-unit' and 'fraction' tags

        if (isAnswer) {
            html += '<span class="tiptext"></span>';
            html += '</span>';  // closing tooltip module tag
            results.push(array);
        }
        return html;
    },

    testNavigation: function (isFirst, isLast) {
        let first = isFirst ? "Start" : "Prev",
            last = isLast ? "Finish" : "Next",
            firstClass = isFirst ? "button-start" : "button-prev"
        lastClass = isLast ? "button-finish" : "button-next",
            html = '<div class="test-navigation">';
        html += '<button class="' + firstClass + '">' + first + '</button>';
        html += isFirst ? ""
            : '<button class="' + lastClass + '">' + last + '</button></div>';
        return html;
    }

},


    maths.handlers = {
        exercises: function (module) {
            let levelChoice = module.container.find(".level"),
                exerciseNumChoice = module.container.find(".exerciseNum"),
                scoreField = module.container.find(".score"),
                score = 0,
                rows = module.container.find(".exercises-operation"),
                answerFields = rows.find(".answer"),
                tooltips = rows.find(".tooltip"),
                showTooltips = maths.settings.general.showTooltips === "true",
                icons = rows.find(".icon"),
                checkButtons = rows.find(".check"),
                resetButton = module.container.find(".reset"),
                reloadButton = module.container.find(".reload"),
                checkAllButton = module.container.find(".check-all"),
                answerField, result, icon, checkBtn, answers, timeout = null;
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
                processOperation = function (index) {
                    answerField = rows.eq(index).find(".answer");
                    icon = icons.eq(index);
                    checkBtn = checkButtons.eq(index);
                    result = module.results[index];
                    answers = [];
                    let isCorrect = maths.handlers.validateOperation(answerField, result, answers);
                    return isCorrect ? goodAnswer() : wrongAnswer();
                };
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
                            tip_center;
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

        validateOperation: function (answerFields, result, answers) {   //validates single operation
            let fraction = [],
                input;
            answers = answers || [];
            answerFields.each(function (idx) {  //collect answer(s) and check if they're not empty
                input = $(this).val();
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

        test: function (module) {
            let rows = module.container.find(".exercises-operation"),
                answerFields = module.container.find(".answer"),
                prevBtn = module.container.find('.button-prev'),
                nextBtn = module.container.find('.button-next'),
                startBtn = module.container.find('.button-start'),
                finishBtn = module.container.find('.button-finish'),
                headers = module.container.find('.test-accordeon-section-header'),
                closeBtn = maths.accordeon.closeBtn;
            closeBtn2 = $("#test-close");
            lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2);

            const processTest = function () {
                let scores = []
                icons = module.container.find(".icon"),
                    results = module.results;
                const wrongAnswer = function (index) {
                    scores[index] = 0;
                    rows.eq(index).find(".answer").addClass("warning");
                    icons.eq(index).prop("src", maths.icons.cross);
                };
                const correctAnswer = function (index) {
                    scores[index] = 1;
                    rows.eq(index).find(".answer").addClass("correct");
                    icons.eq(index).prop("src", maths.icons.tick);
                };
                rows.each(function (idx, row) {
                    let fields = $(row).find(".answer"),
                        result = module.results[idx];
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
                if ($(this).text() === "Start") {
                    let ns = maths.test;
                    maths.timer.init($('.test-accordeon-titlebar-foo'), ns.times[ns.level], ns.summary);
                    maths.accordeon.attachListeners();
                    $(this).text("Next");
                }
                maths.accordeon.show(headers.eq(1), 1);
            });
            prevBtn.on("click", function () {
                let index = prevBtn.index(this);
                maths.accordeon.show(headers.eq(index), index);
            });
            nextBtn.on("click", function () {
                let index = nextBtn.index(this);
                maths.accordeon.show(headers.eq(index + 2), index + 2);
            });
            finishBtn.on("click", function () {
                let scores = processTest();
                answerFields.prop("disabled", "true");
                $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
                maths.test.displayResults(scores, maths.timer.stop());
            });
            closeBtn2.on("click", () => maths.accordeon.dispose());
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

        textInputs: function (rows, answerFields, callback) { //input filtering for answer fields
            answerFields.on("paste", () => false);
            answerFields.on("blur", function () {
                field = $(this);
                if (field.val() === "") {
                    let parent = field.removeClass("warning").parents(".exercises-operation");
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
                let row = $(this).parents(".exercises-operation"),
                    index = rows.index(row),
                    isFraction = row.find(".answer").length > 1;
                char = String.fromCharCode(e.which),
                    length = $(this).val().length;
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
        }
    };



