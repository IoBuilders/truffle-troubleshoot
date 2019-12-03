const abi = require('ethereumjs-abi')
const util = require('ethereumjs-util')

function isValidTransactionHash(transactionHash) {
  return /^0x([A-Fa-f0-9]{64})$/.test(transactionHash);
}

async function checkTransactionStatus(web3, transactionHash) {
  const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash)

  if (transactionReceipt === null) {
    throw new Error('Transaction does not exist in this network')
  }

  if (transactionReceipt.status !== false) {
    throw new Error('The transaction did not revert, it finished successfully.')
  }
}

async function getRevertReason(web3, transaction) {
  const transactionObject = {
    from: transaction.from,
    to: transaction.to,
    value: transaction.value,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    data: transaction.input,
  }

  // the result consists of the function selector, and the encoded string for the revert reason
  const result = await web3.eth.call(transactionObject, transaction.blockNumber)
  const resultWithoutFunctionSelector = util.toBuffer(result).slice(4)

  // the decoding function returns an array because it can be used to decode several values at once
  const decodedValues = abi.rawDecode(["string"], resultWithoutFunctionSelector)

  if (decodedValues.length !== 1) {
    throw new Error('Could not decode the received result')
  }

  // in this case there is only one decoded value, which is the revert reason
  return decodedValues[0]
}

async function revertReason(web3, transactionHash) {
  if (!isValidTransactionHash(transactionHash)) {
    throw new Error(`TransactionHash ${transactionHash} is not valid`)
  }

  await checkTransactionStatus(web3, transactionHash)
  const transaction = await web3.eth.getTransaction(transactionHash)

  return getRevertReason(web3, transaction)
}

module.exports = revertReason
