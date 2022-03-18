const io = require('socket.io-client')
const AsyncReq = require('./asyncReq')

const createXltLibApi = (socket) => {
    const asyncReq = AsyncReq.init(socket)
    socket.onAny((eventName, arg) => {
        asyncReq.socketCommandHandler(eventName, arg)
    })
    return {
        submitXltTransaction: async (tx) => {
            const resp = await asyncReq.asyncRequest('submit_tx', tx)
            delete resp.custom
            return resp
        },
        initWallet: async (publicKey, version) => {
            const resp = await asyncReq.asyncRequest('init_xlt_wallet', {
                publicKey,
                version,
            })
            delete resp.custom
            return resp
        },
        getBalance: async (address) => {
            const resp = await asyncReq.asyncRequest('get_balance', { address })
            delete resp.custom
            return resp
        },
    }
}
const init = (nodeUrl) => {
    return new Promise(async (resolve) => {
        const socket = io(nodeUrl, {
            withCredentials: false,
        })
        socket.on('connect', () => {
            resolve(createXltLibApi(socket))
        })
    })
}

module.exports = {
    init,
}
