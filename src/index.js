const chalk = require('chalk')
const Web3 = require('web3');

const revertReason = require('./revert-reason')

let exitCallBack

function exitWithError(message) {
  exitCallBack(chalk.bold.red(message))
}

function printHelp() {
  console.log(
    '\nUsage: truffle run troubleshoot [options] <command> [commandArguments...] \n\n' +
    'A Truffle plugin to troubleshoot your smart contract problems\n\n' +
    // 'Options:\n' +
    // '  -v, --version                    output the version number\n' +
    // '  -h, --help                       Prints this help information\n\n' +
    'Commands:\n' +
    '  revert-reason <transactionHash>  Get the revert reason of a failed transaction\n'
  )
}

module.exports = async (config, done) => {
  exitCallBack = done

  if (config.network === undefined) {
    config.network = 'development'
  }

  if (config.help) {
    printHelp()
    exitCallBack()
  }

  if (config._.length === 1) {
    printHelp()
    exitWithError('No command given')
  }

  const command = config._[1]
  // process.argv is used here, because config._ seems to convert the arguments in unpredictable ways
  // e.g. a transaction hash is returned as Number object
  const commandArguments = process.argv.splice(5)

  const web3 = new Web3(config.provider)
  let result

  try {
    switch (command) {
      case 'revert-reason':
        result = await revertReason(web3, ...commandArguments)
        break
      default:
        printHelp()
        exitWithError(`${command} is not a valid command`)
    }
  } catch (error) {
    exitWithError(error)
  }

  console.log(`\n${result}\n`)

  done()
}
