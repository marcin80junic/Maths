import { Configuration } from "./module_config";
import { Operand } from "./operand_abstract";



export class FractionOperand extends Operand {

    _value: number[];

    value(): number[] {
        return this._value;
    }
    toString(): string {
        return this._value.toLocaleString();
    }
    reduce(): number | number[] {
        let x = this._value[0],
            y = this._value[1],
            temp: number;

        while (y) {                 // find greatest common divisor
            temp = y;
            y = x % y;
            x = temp;
        }
        return this._value = [this._value[0] / x, this._value[1] / x];
    }
    reduceOperand(): Operand {
        this.reduce();
        return this;
    }
    getLayout(isAnswer?: boolean): string {
        let number = this._value[0] / this._value[1],   // decimal representation of fraction
            wholeNum = Math.floor(number),              // whole part of a fraction
            isInteger = Number.isInteger(number),       // is fraction an integer?
            tempArray = [],
            html = '';

        html += '<div class="fraction">';               // opening fraction tag
        html += (wholeNum >= 1)?                        // is there a whole number before a fraction part?
            (isAnswer === true)?                        // if yes - insert either number or answer field         
                `<div class="whole"><input type="number" 
                    class="answer form-element ${Configuration.noTouchClass}"></div>`
                : `<div class="whole"> ${wholeNum} </div>`
            : ''
        if (isInteger) {            // if fraction is an integer add closing tag and return
            html += '</div>';
            return html;
        }
        // calculate what is left after taking the whole number and construct a fraction
        tempArray = [this._value[0] - (wholeNum * this._value[1]), this._value[1]];
        
        html += `<div class="fraction-unit">    
                    <div class="numerator">`;
        html += isAnswer?                                       // insert text field if at answer index
            `<input type="number" class="answer form-element ${Configuration.noTouchClass}">`
            : tempArray[0]                                      // otherwise insert a number
        html += '</div><div class="denominator">';  // closing 'numerator' tag, opening 'denominator' tag
        html += isAnswer?                                       // insert text field if at answer index
            `<input type="number" class="answer form-element ${Configuration.noTouchClass}">`
            : tempArray[1]                                      // otherwise insert a number
        html += '</div></div></div>';       // closing 'denominator', 'fraction-unit' and 'fraction' tags
        return html;
    }

    draw(context: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }
    
}