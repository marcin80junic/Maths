import { OperationElement } from "./operation_el_interface";
import { IntegerOperand } from "./operand_integer";
import { FractionOperand } from "./operand_fraction";
import { Operand } from "./operand_abstract";
import { CompositeOperand } from "./operand_composite";



export class OperandFactory {

    public static obtainOperand(type: string, values: number | number[] | OperationElement[]): Operand {
        switch (type) {
            case Operand.INTEGER_OPERAND:
                return new IntegerOperand(values);
            case Operand.FRACTION_OPERAND:
                return new FractionOperand([values[0], values[1]]);
            case Operand.COMPOSITE_OPERAND:
                return new CompositeOperand(values);
            default:
                throw new Error(`not recognized operand type: ${type}`);
        }
    }
}