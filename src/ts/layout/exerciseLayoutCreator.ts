import { Configuration } from "../config/configuration";
import { MathModule } from "../maths/mathModule";
import { OperationElement } from "../maths/operation_el_interface";



export class ExerciseLayoutCreator {

    public static createInterfaceContainer(module: MathModule): string {
        let html = '<div class="interface">';

        /* level selection */
        html += `<div class="interface-item">               
                    <label for="level">Difficulty:</label>
                    <select class="level form-element ${Configuration.noTouchClass}">`;
                for (const [key, value] of MathModule.DIFFICULTIES) {
                    html += (module.level === value) ?
                        `<option selected="selected">${key}</option>`
                        : `<option>${key}</option>`;
                };
            html += `</select>
                </div>`;        // end of level selection

        /* number of exercises choice */
        html += `<div class="interface-item">               
                    <label for="exercisesCount">How many exercises?</label>
                    <select class="exercisesCount form-element ${Configuration.noTouchClass}">`;
                for (const value of MathModule.NUM_OF_EXERCISES) {
                    html += (module.exercisesCount === value) ?
                        `<option selected="selected">${value}</option>`
                        : `<option>${value}</option>`;
                }
            html += `</select>
                </div>`;        // end of num of exercises choice

        /* operation length choice */
        html += `<div class="interface-item">
                    <label for="operationLength">How many numbers?</label>
                    <select class="operationLength form-element ${Configuration.noTouchClass}">`;
                for (const length of module.operationLengths) {
                    html += (module.operationLength === length) ?
                        `<option selected="selected">${length}</option>`
                        : `<option>${length}</option>`;
                    }
            html += `</select>
                </div>`;        // end of operation length choice
                
        /* current score */
        html += `<div class="interface-item-score"> 
                    <div>Your Score:</div>
                    <div>
                        <div id="score">0</div>
                        <div>/</div>
                        <div id="score-max">${module.exercisesCount}</div>
                    </div>
                </div>
            </div>`;            // end of interface
        return html;
    }

    public static createMainContainer(module: MathModule, isTest: boolean): string {
        let isFraction: boolean = module.operandTypes.includes("fractions"),
            operation: OperationElement[],
            answerIdx: number,
            html: string;

        html = `<div class="columns">`
        for (let i=0; i<module.numbersBank.length; i++) {
            operation = module.numbersBank[i];
            answerIdx = module.answersMap.get(i);
            html +=                                     // beginning of single operation line
                `<div class="columns-line tooltip">
                    <span class="tiptext"></span>
                    <span class="columns-line-operation${(isFraction)? ' fraction-line': ''}">`;
            for (let j=0; j<operation.length; j++) {
                html += (j === answerIdx)?
                    operation[j].getLayout(true)
                    : operation[j].getLayout(false)
            }
            html += `<img src="${Configuration.ICON_QUESTION}" class="icon">`
            html += !isTest?
                `<button class="check button3d form-element ${Configuration.noTouchClass}">check</button>`
                : '';
            html += `</span>
                </div>`                                 // end of single operation line
        }                                              
        html += '</div>';
        return html;
    }

    public static createButtonsContainer(): string {
        let html =          //bottom button group
            `<div class="interface-buttons">`;
        html += (screen.width > 720)? 
                `<button type="reset" class="reset button3d form-element ${Configuration.noTouchClass}">
                    Reset</button>`
                :'';
        html += `<button type="submit" class="reload button3d form-element ${Configuration.noTouchClass}">
                    Reload</button>
                <button type="submit" class="check-all button3d form-element ${Configuration.noTouchClass}">
                    Check All</button>
            </div>`;    // end of button group
        return html;
    }

}