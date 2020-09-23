import { maths } from './m02-maths';
import type { mathOperation } from './types';


export const layout = {

    exercises: function (module: mathOperation) {
        let num = module.exerciseNum,
            html = "";
        // user interface on top
        html += '<div class="interface">';

        // choice of level
        html += `<div class="interface-item">
                    <label for="level">Difficulty:</label>
                    <select class="level form-element">`;
        maths.difficulties.forEach((item, index) => {
            html += (module.level === index) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of level

        // number of exercises choice
        html += `<div class="interface-item">
                    <label for="exerciseNum">How many exercises?</label>
                    <select class="exerciseNum form-element">`;
        maths.numOfExercises.forEach((item, index) => {
            html += (module.exerciseNum === parseInt(item, 10)) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of num of exercises choice

        // current score
        html += `<div class="interface-item-score"> 
                    <div>Your Score:</div>
                    <div>
                        <div class="score">0</div>
                        <div>/</div>
                        <div>${num}</div>
                    </div>
                </div>`;
        html += '</div>'; // end of interface

        html += this.main(module, num); //add main content and assign results to module's results property
    
        //bottom button group
        html += '<div class="interface-buttons">';
        html += (screen.width > 720)? '<button type="reset" class="reset button3d form-element">Reset</button>':'';
        html += '<button type="submit" class="reload button3d form-element">Reload</button>';
        html += '<button type="submit" class="check-all button3d form-element">Check All</button>';
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
            allNumbers = module.numbers,    // numbers bank
            length = allNumbers.length,     // how many operations in a bank
            numbers: any,       // numbers for single operation
            len: number,        // number of numbers in operation
            random: number,     // a random number used to randomize placement of answer field
            perc: number,       // a chance for number to be an answer field
            index: number,      // index of answer field
            results = module.results,       // bank of answers
            html = '<div class="columns">'; // markup
            
        for (let i = 0; i < length; i += 1) {
            numbers = allNumbers[i]; 
            len = numbers.length;
            if (isRandomized) {     // check whether to randomize answer fields or not
                perc = 1 / len;
                random = Math.random();
                index = Math.floor(random / perc);
            } else {                // if not then answer field is placed on the right of equality sign
                index = len - 1;    // index of answer field
            }
    
            /* single operation */
            html += `<div class="columns-line">
                        <span class="columns-line-operation">`;
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
                '<button type="submit" class="check button3d form-element">check</button>' : "";
            html += '</span></div>';
            /* end of single operation  */
        }

        html += '</div>';
        return html;
    },

    integer: function (number: number, isAnswer: boolean, results: Array<number>) {
        let html = '';
        html += isAnswer ?
            `<div class="tooltip">
                <input type="number" class="answer form-element">
                <span class="tiptext"></span>
            </div>`
            : `<div> ${number} </div>`;
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
                '<div class="whole"><input type="number" class="answer form-element"></div>'
                : `<div class="whole"> ${wholeNum} </div>`
                : ''

        if (isInteger) {    // if fraction is an integer add closing tags and return
            html += '</div>';
            if (isAnswer) {
                html += '<span class="tiptext"></span></span>';
                results.push(array);
            }
            return html;
        }

        // calculate what is left after taking the whole number and construct a fraction
        tempArray = [array[0] - (wholeNum * array[1]), array[1]];
        
        html += `<div class="fraction-unit">    
                    <div class="numerator">`;
        html += isAnswer?                                                // insert text field if at answer index
            '<input type="number" class="answer form-element" size="1">'
            : tempArray[0]                                               // otherwise insert a number
        html += '</div><div class="denominator">';    // closing 'numerator' tag, opening 'denominator' tag
        html += isAnswer?                                                // insert text field if at answer index
            '<input type="number" class="answer form-element" size="1">'
            : tempArray[1]                                               // otherwise insert a number
        html += '</div></div></div>';           // closing 'denominator', 'fraction-unit' and 'fraction' tags

        if (isAnswer) {
            html += '<span class="tiptext"></span></span>';  // closing tooltip module tag
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

        html += `<button class="${firstClass} form-element button3d">${first}</button>`;
        html += isFirst ? '</div>'
            : `<button class="${lastClass} form-element button3d">${last}</button></div>`;

        return html;
    }

};
