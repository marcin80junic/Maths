import { OperationElement } from "./operation_el_interface";
import { IntegerOperand } from "./operand_integer";
import { FractionOperand } from "./operand_fraction";
import { Operand } from "./operand_abstract";
import { CompositeOperand } from "./operand_composite";



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