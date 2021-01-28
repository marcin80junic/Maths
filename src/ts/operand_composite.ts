import { MathModule } from "./module_math";
import { Operand } from "./operand_abstract";
import { OperandFactory } from "./operand_factory";
import { OperationElement } from "./operation_el_interface";



export class CompositeOperand extends Operand {

    protected _value: OperationElement[];

    value(): number | number[] {
        return MathModule.reduce(this._value);
    }
    toString(): string {
        let str = '';
        for (const el of this._value) {
            str += el.toString() + ' ';
        }
        return str;
    }
    reduce(): number | number[] {
        return MathModule.reduce(this._value);
    }
    reduceOperand(): Operand {
        let total = this.reduce(),
            totalType = (typeof total === "number")?        // determine type of operand
                Operand.INTEGER_OPERAND
                : Operand.FRACTION_OPERAND;
        return OperandFactory.obtainOperand(totalType, total);
    }
    getLayout(): string {
        let html = '(';
        for (const el of this._value) {
            html += el.getLayout();
        }
        return html + ')';
    }

    draw(context: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }

}