import { IXLTTransaction, IXLTPublicTx, IXLTLibApi } from './xlt/xltModels'

export type TKeys = {
    secret?: string
    privateKey: string
    publicKey: string
    version: number
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
    /**
     * Init node connection
     * @param nodeUrl xlt network node url
     */
    init: (nodeUrl: string) => Promise<IXLTLibApi>
    createXLTTransaction: (address: string, to_address: string, amount: number, comment?: string) => IXLTPublicTx
    signXLTTransaction: (tx: IXLTPublicTx, publicKey: string, privateKey: string) => IXLTTransaction
}
export { xltLibT, IXLTTransaction, IXLTPublicTx, IXLTLibApi }
export declare const xltLib: xltLibT
