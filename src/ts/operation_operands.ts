import { Configuration } from "./module_config";
import { OperationElement } from "./operation";


export class OperandFactory {

    public static obtainOperand(type: string, values: number | number[]): Operand {
        switch (type) {
            case Operand.INTEGER_OPERAND:
                return new IntegerOperand(values);
            case Operand.FRACTION_OPERAND:
                return new FractionOperand([values[0], values[1]]);
            case Operand.COMPOSITE_OPERAND:
                const elements: OperationElement[] = [];
           /*     for (const element of values) {
                    if ('value' in element) {
                        elements.push(element);
                    }
                }*/
                return new CompositeOperand(elements);
            default:
                throw new Error(`not recognized operand type: ${type}`);
        }
    }
}


export abstract class Operand implements OperationElement {

    public static readonly INTEGER_OPERAND = "integer";
    public static readonly FRACTION_OPERAND = "fraction";
    public static readonly COMPOSITE_OPERAND = "composite";

    protected _value: number | number[];

    constructor(value: number | number[]) {
        this._value = value;
    }

    abstract value(): number | number[];
    abstract reduce(): Operand;
    abstract getLayout(isAnswer?: boolean): string;
    abstract draw(context: CanvasRenderingContext2D): void;

}



export class IntegerOperand extends Operand {

    value(): number | number[] {
        return this._value;
    }
    reduce(): Operand {
        return this;
    };
    getLayout(isAnswer?: boolean): string {
        return (isAnswer === true)?
            `<input type="number" class="answer form-element ${Configuration.noTouchClass}">`
            : `<div>${this._value}</div>`;
    }
    draw(context: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }

}

export class FractionOperand extends Operand {

    _value: number[];

    value(): number[] {
        return this._value;
    }
    reduce(): Operand {
        let x = this._value[0],
            y = this._value[1],
            temp: number;
        while (y) {                             // find greatest common divisor
            temp = y;
            y = x % y;
            x = temp;
        }
        this._value = [this._value[0] / x, this._value[1] / x];
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
        if (isInteger) {                           // if fraction is an integer add closing tag and return
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

export class CompositeOperand extends Operand {

    private _values: OperationElement[];

    constructor(value: OperationElement[]) {
        super(0);
        this._values = value;
    }

    getOperand(min: number, max: number): Operand {
        throw new Error("Method not implemented.");
    }
    value(): number | number[] {
        let total = (<Operand>this._value[0]).value();
        for (let i=2; i<this._values.length; i+=2) {
         //   total = (<Operator>this._value[i-1]).reduce(total, <Operand>this._value[i]).value();
        }
        return total;
    }
    reduce(): Operand {
        //
        return this;
    }
    getLayout(): string {
        //
        return ''
    }
    draw(context: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }

}