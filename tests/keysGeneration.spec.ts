// import {xl from '@yllo/xlt-lib'
import { xltLib } from '@yllo/xlt-lib'
describe('XLT Wallet generation', () => {
    it('Keys', (done) => {
        const keys = xltLib.generateKeys()
        if (!keys.address || !keys.secret || !keys.version || !keys.privateKey || !keys.publicKey) {
            throw new Error(`No key`)
        }
        const restoredKeys = xltLib.restoreKeysFromSecret(keys.secret)
        Object.keys(restoredKeys).forEach((k) => {
            if (restoredKeys[k] !== keys[k]) {
                throw new Error(`Restore error`)
            }
        })
        done()
    })
})
