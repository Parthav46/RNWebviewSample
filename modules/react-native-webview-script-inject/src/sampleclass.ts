export class Inject {
    multiply(a: number, b: number): Promise<number> {
        return Promise.resolve(a * b);
    }

    log(val: string): void {
        console.log(val);
    }
}