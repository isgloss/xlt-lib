const init = (socket) => {
    const awaitingIds = {}
    const socketCommandHandler = (cmd, mes) => {
        if (!cmd || !mes || !mes.custom) {
            return
        }

        if (awaitingIds[mes.custom] && awaitingIds[mes.custom].type == 'awaiting') {
            awaitingIds[mes.custom] = {
                mes,
                type: 'loaded',
            }
        }
    }

    /**
     * Converting socket to async functions
     * @param cmd cmd name
     * @param {*} data
     * @returns {Promise<any>}
     */
    const asyncRequest = async (cmd, data) => {
        const generatedId = cmd + Math.random().toFixed(3).toString()
        awaitingIds[generatedId] = { type: 'awaiting' }
        socket.emit(cmd, { ...data, custom: generatedId })
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (awaitingIds[generatedId].type == 'loaded') {
                    clearInterval(interval)
                    const mes = awaitingIds[generatedId].mes
                    delete awaitingIds[cmd + mes.custom]
                    resolve(mes)
                }
            }, 10)
        })
    }
    return { asyncRequest, socketCommandHandler }
}

module.exports = {
    init,
}
