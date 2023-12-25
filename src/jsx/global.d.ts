//@ts-ignore
declare var JSON: {
  stringify(object: object): string;
  parse(string: string): object;
};

interface ObjectConstructor {
  freeze<T>(object: T): T;
}

interface ArrayConstructor {
  isArray<T>(arg: any): arg is Array<T>;
}

declare function JSXGetURL(): {
  get(url: string, file?: string): string;
  addRequestHeader(header: string): void;
  getResponseHeaders(): string;
}
