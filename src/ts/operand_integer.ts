import { Configuration } from "./module_config";
import { Operand } from "./operand_abstract";



export class IntegerOperand extends Operand {

    value(): number | number[] {
        return this._value;
    }
    toString(): string {
        return this._value.toLocaleString();
    }
    reduce(): number | number[] {
        return this._value;
    };
    reduceOperand(): Operand {
        return this;
    }
    getLayout(isAnswer?: boolean): string {
        return (isAnswer === true)?
            `<input type="number" class="answer form-element ${Configuration.noTouchClass}">`
            : `<div>${this._value}</div>`;
    }
    draw(context: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }

}