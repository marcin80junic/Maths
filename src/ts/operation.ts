


export interface OperationElement {

    value (): number | number[];
    toString(): string;
    reduce(prev?: number | number[], current?: number | number[]): number | number[];
    getLayout (isAnswer?: boolean): string;
    draw (context: CanvasRenderingContext2D): void;

}