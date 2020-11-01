import { OperationElement } from "./operation_el_interface";



export abstract class Operand implements OperationElement {

    public static readonly INTEGER_OPERAND = "integer";
    public static readonly FRACTION_OPERAND = "fraction";
    public static readonly COMPOSITE_OPERAND = "composite";

    protected _value: number | number[];

    constructor(value: number | number[]) {
        this._value = value;
    }

    abstract value(): number | number[];
    abstract toString(): string;
    abstract reduce(): number | number[];
    abstract reduceOperand(): Operand;
    abstract getLayout(isAnswer?: boolean): string;
    abstract draw(context: CanvasRenderingContext2D): void;

}
