
import { MathOperation } from './m01-prototype';
import { maths } from './m02-maths';


export const layout = {

    exercises: function (module: MathOperation) {
        let num = module.exercisesCount,
            html = "";
        // user interface on top
        html += '<div class="interface">';

        // choice of level
        html += `<div class="interface-item">
                    <label for="level">Difficulty:</label>
                    <select class="level form-element ${maths.noTouchClass}">`;
        maths.difficulties.forEach((item, index) => {
            html += (module.level === index) ?
                '<option selected="selected">' + item + '</option>'
                : '<option>' + item + '</option>';
        });
        html += '</select></div>';  // end of level

        // number of exercises choice
        html += `<div class="interface-item">
                    <label for="exerciseNum">How many exercises?</label>
                    <select class="exerciseNum form-element ${maths.noTouchClass}">`;
        maths.numOfExercises.forEach((item, index) => {
            html += (num === parseInt(item, 10)) ?
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

        html += this.main(module, num); // add main content and assign results to module's results property
    
        //bottom button group
        html += '<div class="interface-buttons">';
        html += (screen.width > 720)? 
            `<button type="reset" class="reset button3d form-element ${maths.noTouchClass}">Reset</button>`
            :'';
        html += `<button type="submit" class="reload button3d form-element ${maths.noTouchClass}">Reload</button>
                 <button type="submit" class="check-all button3d form-element ${maths.noTouchClass}">Check All</button>
                </div>`;   // end of button group
        module.levelDisplayed = module.level;
        module.container.html(html);
    },

    main: function (module: MathOperation) {

        let isTest = module.name === "test",
            isRandomized = (maths.settings.general.isRandomized === "true"), 
            isFraction = (module.name === "fractions"),
            isAnswer: boolean,
            numsBank = module.numbersBank,  // numbers bank
            bankCount = numsBank.length,    // how many operations in a bank
            operation: any,                 // single operation
            lineLength: number,             // length of operation
            perc: number,                   // a chance for number to be an answer field
            ansIndex: number,               // index of answer field
            html: string;                   // markup
        
        html = '<div class="columns">';

        for (let i=0; i<bankCount; i+=1) {
            
            operation = numsBank[i]; 
            lineLength = operation.length;
            if (isRandomized) {                 // check whether to randomize answer fields or not
                perc = 1 / Math.floor(lineLength / 2);
                ansIndex = Math.floor(Math.random() / perc) * 2;
            } else {                            // if not then answer field is placed on the right of equality sign
                ansIndex = lineLength - 1;
            }
            module.answersMap.set(i, ansIndex); // set index of answer in modules answers map
    
            /* single operation line */
            html += `<div class="columns-line tooltip">
                        <span class="tiptext"></span>
                        <span class="columns-line-operation${isFraction? ' fraction-line': ''}">`;
            
            for (let j=0; j<lineLength; j+=1) {
                if (j % 2 === 0) {              // every second element is number
                    isAnswer = (j === ansIndex);
                    html += isFraction?         // methods below return layout for either fraction or integer
                    this.fraction(operation[j], isAnswer)
                    : this.integer(operation[j], isAnswer);
                } else {                        // operation signs got odd indexes
                    html += `<div>${operation[j]}</div>`;
                } 
            }
            html += '<img src="' + maths.icons.questMark + '" class="icon">';
            html += !isTest ?  // insert a check button if not a test
                `<button type="submit" class="check button3d form-element ${maths.noTouchClass}">check</button>`
                : "";
            html += '</span></div>';
            /* end of single operation line */
        }

        html += '</div>';
        return html;
    },

    integer: function (number: number, isAnswer: boolean) {
        return isAnswer ?
            `<input type="number" class="answer form-element ${maths.noTouchClass}">`
            : `<div> ${number} </div>`;
    },

    fraction: function (array: Array<number>, isAnswer: boolean) {
        let number = array[0] / array[1],   // decimal representation of fraction
            wholeNum = Math.floor(number),  // whole part of a fraction
            isInteger = Number.isInteger(number),   // is fraction an integer?
            tempArray = [],
            html = '';

        html += '<div class="fraction">';   // opening fraction tag
        html += (wholeNum >= 1)?    // is there a whole number before a fraction part?
            isAnswer?               // if yes - insert either number or answer field         
                `<div class="whole"><input type="number" class="answer form-element ${maths.noTouchClass}"></div>`
                : `<div class="whole"> ${wholeNum} </div>`
            : ''
        if (isInteger) {    // if fraction is an integer add closing tag and return
            html += '</div>';
            return html;
        }

        // calculate what is left after taking the whole number and construct a fraction
        tempArray = [array[0] - (wholeNum * array[1]), array[1]];
        
        html += `<div class="fraction-unit">    
                    <div class="numerator">`;
        html += isAnswer?                                                // insert text field if at answer index
            `<input type="number" class="answer form-element ${maths.noTouchClass}">`
            : tempArray[0]                                               // otherwise insert a number
        html += '</div><div class="denominator">';    // closing 'numerator' tag, opening 'denominator' tag
        html += isAnswer?                                                // insert text field if at answer index
            `<input type="number" class="answer form-element ${maths.noTouchClass}">`
            : tempArray[1]                                               // otherwise insert a number
        html += '</div></div></div>';               // closing 'denominator', 'fraction-unit' and 'fraction' tags
        return html;
    },

    testNavigation: function (isFirst: boolean, isLast: boolean) {
        let first = isFirst ? "Start" : "Prev",
            last = isLast ? "Finish" : "Next",
            firstClass = isFirst ? "button-start" : "button-prev",
            lastClass = isLast ? "button-finish" : "button-next",
            html = '<div class="test-navigation">';

        html += `<button class="${firstClass} form-element ${maths.noTouchClass} button3d">${first}</button>`;
        html += isFirst ? '</div>'
            : `<button class="${lastClass} form-element ${maths.noTouchClass} button3d">${last}</button></div>`;

        return html;
    }

};
