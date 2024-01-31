declare enum ElementPlacement {
  INSIDE = 'inside',
  PLACEAFTER = 'placeAfter',
  PLACEATBEGINNING = 'placeAtBeginning',
  PLACEATEND = 'placeAtEnd',
  PLACEBEFORE = 'placeBefore',
}

declare var JSON: {
  stringify(object: object): string;
  parse(string: string): object;
};
