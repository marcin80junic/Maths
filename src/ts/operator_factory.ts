import { EqualsOperator, Operator } from "./operator_abstract";
import { AdditionOperator } from "./operator_addition";
import { MultiplicationOperator } from "./operator_multiplication";
import { SubtractionOperator } from "./operator_subtraction";


export class OperatorFactory {
    
    public static obtainOperator(name: string): Operator {
        switch(name) {
            case Operator.ADDITION_OPERATOR:
                return AdditionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.SUBTRACTION_OPERATOR:
                return SubtractionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.MULTIPLICATION_OPERATOR:
                return MultiplicationOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.DIVISION_OPERATOR:
                return AdditionOperator.getInstance(Operator.OPERATORS.get(name));
            case Operator.EQUALS_OPERATOR:
                return EqualsOperator.getInstance(Operator.OPERATORS.get(name));
            default:
                throw new Error('not recognized operator string');
        }
    }
}
