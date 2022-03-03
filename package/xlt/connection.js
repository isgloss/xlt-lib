const axios = require('axios').default
const io = require('socket.io-client')
const AsyncReq = require('./asyncReq')
const isLocalApi = false
const XLT_REST_URL = isLocalApi ? 'http://localhost:3099' : 'https://yllo.tech:--'
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
        getBalance: async (address) => {
            const resp = await asyncReq.asyncRequest('get_balance', { address })
            delete resp.custom
            return resp
        },
    }
}
const init = () => {
    return new Promise(async (resolve) => {
        const socketServerUrl = (await axios.get(XLT_REST_URL + '/socketUrl/')).data
        const socket = io(socketServerUrl, {
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
