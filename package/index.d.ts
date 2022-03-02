type TKeys = {
    secret: string
    privateKey: string
    publicKey: string
    version: string
    address: string
}
type xltLibT = {
    /**
     * Restore all keys from secret
     */
    restoreKeysFromSecret: (secret: string) => TKeys
    /**
     * Sign String
     */
    signStr: (std: string, publicKey: string, privateKey: string) => string
    /**
     * Generate new keys
     */
    generateKeys: () => TKeys
}
export { xltLibT }
export declare const xltLib: xltLibT
