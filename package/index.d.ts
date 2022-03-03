import { IXLTTransaction, IXLTPublicTx, IXLTLibApi } from './xlt/xltModels'

type TKeys = {
    secret?: string
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
    /**
     * Init node connection
     */
    init: () => Promise<IXLTLibApi>
    createXLTTransaction: (address: string, to_address: string, amount: number, comment?: string) => IXLTPublicTx
    signXLTTransaction: (tx: IXLTPublicTx, publicKey: string, privateKey: string) => IXLTTransaction
}
export { xltLibT, IXLTTransaction, IXLTPublicTx, IXLTLibApi }
export declare const xltLib: xltLibT
