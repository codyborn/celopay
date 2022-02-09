import { ethers, BigNumber } from "ethers"
import Web3 from "web3"
import { CeloTx } from '@celo/connect'
import { newKitFromWeb3 } from "@celo/contractkit"

const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");

const cUSDMainnetAddress = "0x765de816845861e75a25fca122bb6898b8b1282a"

/*
 * Client side method to create a cUSD payment
 * Returns the paymentId which can be used to verify the payment
 */
export async function createPayment(
    web3: Web3,
    toAddress: string,
    amount: BigNumber,
    transactionParams: CeloTx = undefined
): Promise<string> {
    if (!web3.eth.defaultAccount) {
        throw new Error("No defaultAccount on web3 object")
    }
    const kit = newKitFromWeb3(web3)
    let cUSDtoken = await kit.contracts.getStableToken()
    let cUSDtx = await cUSDtoken
        .transfer(toAddress, amount.toString())
        .send({ from: web3.eth.defaultAccount, ...transactionParams })
    let cUSDReceipt = await cUSDtx.waitReceipt()

    console.log("cUSD Transaction receipt: %o", cUSDReceipt);
    return cUSDReceipt.transactionHash
}

/*
 * Server-side check to ensure payment was completed
 * Verifies payment is in cUSD, from the user's address, and
 * being sent to the correct recipient.
 * Returns the amount paid
 */
export async function getPaymentAmount(txHash: string, fromAddress: string, toAddress: string): Promise<BigNumber> {
    const receipt = await provider.getTransactionReceipt(txHash)
    const abi = [ "event Transfer(address indexed from, address indexed to, uint256 value)", "event TransferComment(string comment)" ]
    const abiInterface = new ethers.utils.Interface(abi)
    if (receipt.to.toLowerCase() !== cUSDMainnetAddress.toLowerCase()) {
        console.log(`${txHash} Payment in unexpected token`)
        return BigNumber.from(0)
    }

    const events = receipt.logs.map((log) => abiInterface.parseLog(log))
    let paymentAmount = BigNumber.from(0)
    events.forEach(event => {
        if (event.name === "Transfer") {
            // event.args => from, to, value
            if (event.args.length === 3 &&
                event.args[0].toLowerCase() === fromAddress.toLowerCase() &&
                event.args[1].toLowerCase() === toAddress.toLowerCase()) {
                // We found an expected transfer event
                let amount = BigNumber.from(event.args[2])
                console.log(`${txHash} Payment found - ${paymentAmount.toString()}`)
                paymentAmount = paymentAmount.add(amount)
            }
        }
    })
    
    return paymentAmount
}

