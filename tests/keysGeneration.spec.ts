import { expect } from 'chai'
import { xltLib } from '@yllo/xlt-lib'
import 'mocha'
import conf from './conf'

describe('Crypto Generation', () => {
    it('New wallet', (done) => {
        const keys = xltLib.generateKeys()
        if (!keys.address || !keys.secret || !keys.version || !keys.privateKey || !keys.publicKey) {
            throw new Error(`No key`)
        }
        const restoredKeys = xltLib.restoreKeysFromSecret(keys.secret)
        Object.keys(restoredKeys).forEach((k) => {
            expect(restoredKeys[k]).to.equal(keys[k])
        })
        done()
    })
    it('Restore', (done) => {
        const restoredKeys = xltLib.restoreKeysFromSecret(conf.testXLTWallets[0].secret)
        expect(restoredKeys.address).to.equal(conf.testXLTWallets[0].address)
        done()
    })
})
