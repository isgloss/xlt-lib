type txId = string
type TRespWrapper<T> =
    | {
          result: 1
          err?: string
          custom?: string
      }
    | {
          result: 0
          data: T
          custom?: string
      }
export interface IXLTTransaction extends IXLTPublicTx {
    sign: string
}

export interface IXLTPublicTx {
    address: string
    to_address: string
    val: string
    comment?: string
}

export interface IXLTLibApi {
    submitXltTransaction: (tx: IXLTTransaction) => Promise<TRespWrapper<{ txId: txId }>>
    initWallet: (publicKey: string, version: number) => Promise<TRespWrapper<undefined>>
    getBalance: (address: string) => Promise<TRespWrapper<{ balance: number; address: string }>>
}
