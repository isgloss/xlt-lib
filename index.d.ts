import { IRestoredKeys } from "./xlt/types";
declare module "xltLib" {
  export function restoreKeysFromSecret(secret: string): IRestoredKeys | null;
  export function signStr(
    str: string,
    publicKey: string,
    privateKey: string
  ): string | null;
  export function generateKeys(version: string): IRestoredKeys;
}

export { IRestoredKeys };
