const posix = (str: string) => str.replace(/\\/g, "/");
const encodeSpaces = (str: string) => str.replace(/ /g, "%20");

export const cepBasename = window.cep_node
  ? encodeSpaces(posix(window.cep_node.global.__dirname))
  : '/';
