
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
        html += '<div class="control">';
        html += '<input type="reset" class="reset">';
        html += '<input type="submit" value="Reload" class="reload">';
        html += '<input type="submit" value="Check All" class="check-all">';
        html += '</div>';   // end of button group
        module.levelDisplayed = module.level;
        module.container.html(html);
    },

    main: function (module) {
        let num = module.exerciseNum,
            allNumbers = module.numbers, // numbers bank
            numbers, index, perc, len, random, i, j, isFraction, isAnswer,
            half = num / 2, //half of all operations
            sign = module.sign,
            isTest = module.name === "test",
            isRandomized = module.randomized,
            results = module.results,
            html = '<div class="exercises">';
    //    html += '<div class="flex flex-content-column">';
        for (i = 0; i < num; i += 1) {
            numbers = allNumbers[i];  // numbers for single operation
            len = numbers.length;
            if (isRandomized) { // if true randomize placement of answer field
                perc = 1 / len; // a chance for number to be an answer field
                random = Math.random();
                index = Math.floor(random / perc); // index of answer field
            } else {  // answer field on the right of equality sign
                index = len - 1; // index of answer field
            }
            if (i === half) {  //start second column in the middle of iteration
      //          html += '</div><div class="flex flex-content-column">';
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
            html += '<img src="' + maths.questMark + '" class="icon">';
            html += !isTest ?  // insert a check button if not a test
                '<input type="submit" value="check" class="check">' : "";
            html += '</div>';
            // end of single operation
        }
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
        let number = array[0] / array[1],
            isInteger = Number.isInteger(number),
            modulus = [array[0], array[1]],
            html = '';
        number = Math.floor(number);
        if (number >= 1) {
            html += isAnswer ?
                '<div class="tooltip"><input type="text" maxlength="1" class="answer close vertical-center">' +
                '<span class="tiptext"></span>'
                : '<div class="close">' + number + '</div>';
            if (isInteger) {
                if (isAnswer) {
                    html += "</div>";
                    results.push(array);
                }
                return html;
            }
            modulus = [array[0] - number * array[1], array[1]];
        }
        if (isAnswer) {
            html += (number >= 1)?
                '<div class="fraction">'
                : '<div class="fraction tooltip">';
            html += '<div><input type="text" maxlength="3" class="answer"></div>';
            html += '<div class="dash">/</div>';
            html += '<div class="bottom"><input type="text" maxlength="3" class="answer"></div>';
        //    html += '<span class="tiptext"></span></div>';
            html += (number >= 1)? '</div></div>': '<span class="tiptext"></span></div>';
            results.push(array);
        } else {
            html += '<div class="fraction">';
            html += '<div>' + modulus[0] + '</div>';
            html += '<div class="dash">/</div>';
            html += '<div class="bottom">' + modulus[1] + '</div></div>';
        }
        return html;
    },

    testNavigation: function (isFirst, isLast) {
        let first = isFirst ? "Start" : "Prev",
            last = isLast ? "Finish" : "Next",
            firstClass = isFirst ? "accordeon-button-start" : "accordeon-button-prev"
        lastClass = isLast ? "accordeon-button-finish" : "accordeon-button-next",
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
                icons = rows.find(".icon"),
                checkButtons = rows.find(".check"),
                resetButton = module.container.find(".reset"),
                reloadButton = module.container.find(".reload"),
                checkAllButton = module.container.find(".check-all"),
                answerField, result, icon, checkBtn, answers, timeout = null;
            const goodAnswer = function () {
                scoreField.text(++score);
                answerField.each(function (idx) {
                    $(this).hide().after("<span>" + answers[idx] + "</span>");
                });
                icon.prop("src", maths.tick);
                checkBtn.addClass("invisible");
                return true;
            },
                wrongAnswer = function () {
                    icon.prop("src", maths.cross);
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
                if (module.tooltips = true) {       // to be changed!
                    let tip = $(this).find(".tiptext"),
                        idx = tooltips.index(this);
                    if (e.type === "mouseover") {
                        timeout = setTimeout(function () {
                            if (tip.children().length === 0) {
                                maths.createAndAppendCanvas(tip, module, idx);
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
            });
            resetButton.on("click", () => {    //reset button
                score = 0;
                scoreField.text(score);
                answerFields.show().removeClass("warning").next().remove();
                icons.prop("src", maths.questMark);
                checkButtons.removeClass("invisible");
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
            let rows = module.container.find(".flex-row"),
                answerFields = module.container.find(".answer"),
                prevBtn = module.container.find('.accordeon-button-prev'),
                nextBtn = module.container.find('.accordeon-button-next'),
                startBtn = module.container.find('.accordeon-button-start'),
                finishBtn = module.container.find('.accordeon-button-finish'),
                headers = module.container.find('.accordeon-section-header'),
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
                    icons.eq(index).prop("src", maths.cross);
                };
                const correctAnswer = function (index) {
                    scores[index] = 1;
                    rows.eq(index).find(".answer").addClass("correct");
                    icons.eq(index).prop("src", maths.tick);
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
                    maths.timer.init($('.accordeon-titlebar-foo'), ns.time[ns.level], ns.summary);
                    maths.accordeon.attachListeners();
                    $(this).text("Next");
                }
                maths.accordeon.show(headers.eq(1));
            });
            prevBtn.on("click", function () {
                let index = prevBtn.index(this);
                maths.accordeon.show(headers.eq(index));
            });
            nextBtn.on("click", function () {
                let index = nextBtn.index(this);
                maths.accordeon.show(headers.eq(index + 2));
            });
            finishBtn.on("click", function () {
                let scores = processTest();
                answerFields.prop("disabled", "true");
                $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
                maths.test.displayResults(scores, maths.timer.stop());
            });
            closeBtn2.on("click", () => maths.accordeon.dispose());
            lastFocusableElements.on("keydown", function (e) { // keep focus inside the dialog container
                if (e.which === 9) {
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
                    parent.find(".icon").prop("src", maths.questMark);
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



