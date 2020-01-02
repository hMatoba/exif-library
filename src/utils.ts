export type IfdField = {
  type: number;
  length: number;
  value: string;
};

export const repeatString = (ch: string, num: number): string => {
  let str = "";
  for (let i = 0; i < num; i++) {
    str += ch;
  }
  return str;
};

const isBrowser = new Function(
  "try {return this===window;}catch(e){ return false;}"
)();

export const atob: Function = isBrowser
  ? window.atob
  : (input: string): Buffer => {
      const decoded = Buffer.from(input, "base64");
      return decoded;
    };

export const btoa: Function = isBrowser
  ? window.btoa
  : (input: string): string => {
      const buf = Buffer.from(input);
      const encoded = buf.toString("base64");
      return encoded;
    };

export const copyObject = (obj: object): object => {
  const copied = {};
  Object.assign(copied, obj);
  return copied;
};
