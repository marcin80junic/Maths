


export interface OperationElement {

    value (): string | number | number[];
    getLayout (isAnswer?: boolean): string;
    draw (context: CanvasRenderingContext2D): void;

}