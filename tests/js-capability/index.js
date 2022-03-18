// This is Low level capability
const xltLib = require('@yllo/xlt-lib').xltLib
const conf = require('../conf')
const expect = require("chai").expect

const sendSignedTx = async (api) => {
    const restoredKeys = xltLib.restoreKeysFromSecret(conf.testXLTWallets[0].secret)
    const createdTx = xltLib.createXLTTransaction(restoredKeys.address, conf.testXLTWallets[1].address, 0.1)
    const signedtx = xltLib.signXLTTransaction(createdTx, restoredKeys.publicKey, restoredKeys.privateKey)
    const txRes = await api.submitXltTransaction(signedtx)
    console.log(txRes)
    expect(0).to.equal(txRes.result)
}
const fetchAddressBalance = async (api) => {
    const txRes = await api.getBalance(conf.testXLTWallets[0].address)
    console.log(txRes)
    expect(0).to.equal(txRes.result)
}
const init = async () => {
    const xltApi = await xltLib.init('http://localhost:3099/')
    sendSignedTx(xltApi)
    fetchAddressBalance(xltApi)
}

init()
