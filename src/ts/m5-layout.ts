import { maths } from './m2-resources';
import type { mathOperation } from './types';

export { layout };


const layout = {

    exercises: function (module: mathOperation) {
        let num = module.exerciseNum,
            html = "";
        // user interface on top
        html += '<div class="interface">';

        // choice of level
        html += `<div class="interface-item">
                    <label for="level">Difficulty:</label>
                    <select class="level">`;
        maths.difficulties.forEach((item, index) => {
            html += (module.level === index) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of level

        // number of exercises choice
        html += `<div class="interface-item">
                    <label for="exerciseNum">How many exercises?</label>
                    <select class="exerciseNum">`;
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

    main: function (module: mathOperation) {
        let isTest = module.name === "test",
            isRandomized = (maths.settings.general.isRandomized === "true"), 
            isFraction: boolean,
            isAnswer: boolean,
            sign: string = module.sign,
            allNumbers = module.numbers, // numbers bank
            length = allNumbers.length,     // how many operations in a bank
            numbers: any,   // numbers for single operation
            len: number,    // number of numbers in operation
            random: number,    // a random number used to randomize placement of answer field
            perc: number,   // a chance for number to be an answer field
            index: number,  // index of answer field
            results = module.results,   // bank of answers
            html = '<div class="columns">';     // markup
            
        for (let i = 0; i < length; i += 1) {
            numbers = allNumbers[i]; 
            len = numbers.length;
            if (isRandomized) {     // check whether to randomize answer fields or not
                perc = 1 / len;
                random = Math.random();
                index = Math.floor(random / perc);
            } else {  // if not then answer field is placed on the right of equality sign
                index = len - 1; // index of answer field
            }
    
            // single operation
            html += '<div class="columns-line">';
            for (let j = 0; j < len; j += 1) {
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
            // end of single operation
        }   

        html += '</div>';
        return html;
    },

    integer: function (number: number, isAnswer: boolean, results: Array<number>) {
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

    fraction: function (array: Array<number>, isAnswer: boolean, results: Array<Array<number>>) {
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
            if (isAnswer) {
                html += '<span class="tiptext"></span></span>';
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

    testNavigation: function (isFirst: boolean, isLast: boolean) {
        let first = isFirst ? "Start" : "Prev",
            last = isLast ? "Finish" : "Next",
            firstClass = isFirst ? "button-start" : "button-prev",
            lastClass = isLast ? "button-finish" : "button-next",
            html = '<div class="test-navigation">';

        html += '<button class="' + firstClass + '">' + first + '</button>';
        html += isFirst ? ""
            : '<button class="' + lastClass + '">' + last + '</button></div>';

        return html;
    }

};
