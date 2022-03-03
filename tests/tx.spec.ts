import { xltLib } from '@yllo/xlt-lib'
import conf from './conf'
describe('XLT Transactions', () => {
    it('Create Tx', (done) => {
        const restoredKeys = xltLib.restoreKeysFromSecret(conf.testXLTWallets[0].secret)
        const createdTx = xltLib.createXLTTransaction(restoredKeys.address, conf.testXLTWallets[1].address, 0.1)
        const signedtx = xltLib.signXLTTransaction(createdTx, restoredKeys.publicKey, restoredKeys.privateKey)
        done()
    })
})
