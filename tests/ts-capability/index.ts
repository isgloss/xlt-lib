// This is High level capability
import { IXLTLibApi, xltLib } from '@yllo/xlt-lib'
import { expect } from 'chai'
import conf from '../conf'

const sendSignedTx = async (api: IXLTLibApi) => {
    const restoredKeys = xltLib.restoreKeysFromSecret(conf.testXLTWallets[0].secret)
    const createdTx = xltLib.createXLTTransaction(restoredKeys.address, conf.testXLTWallets[1].address, 0.1)
    const signedtx = xltLib.signXLTTransaction(createdTx, restoredKeys.publicKey, restoredKeys.privateKey)
    const txRes = await api.submitXltTransaction(signedtx)
    console.log(txRes)
    expect(0).to.equal(txRes.result)
}
const fetchAddressBalance = async (api: IXLTLibApi) => {
    const txRes = await api.getBalance(conf.testXLTWallets[0].address)
    console.log(txRes)
    expect(0).to.equal(txRes.result)
}
const init = async () => {
    const xltApi = await xltLib.init()
    sendSignedTx(xltApi)
    fetchAddressBalance(xltApi)
}

init()
