//@ts-ignore
declare var JSON: {
  stringify(object: object): string;
  parse(string: string): object;
};

declare function JSXGetURL(): {
  get(url: string, file?: string): string;
  addRequestHeader(header: string): void;
  getResponseHeaders(): string;
}
