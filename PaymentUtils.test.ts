import { createPayment, getPaymentAmount } from './PaymentUtils'
import { BigNumber } from "ethers"
import Web3 from "web3"

// Integration tests. 
// These tests require a network connectivity to reach mainnet
describe(getPaymentAmount, () => {
    // https://explorer.celo.org/tx/0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a/token-transfers
    it('Returns correct payment amount', async () => {
      await expect(
        getPaymentAmount(
          "0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a",
          "0x7207c4e548b4d1179f5732a1faa2b61b714cb3e2",
          "0x765DE816845861e75A25fCA122bb6898B8B1282a"
          )
      ).resolves.toMatchObject(BigNumber.from("20000000000000000000"))
    })

    // https://explorer.celo.org/tx/0x43367d0f5120f67c97befbc810a101c6402eec3c02e406f3fd3bf6d9b1a4e452/token-transfers
    it('Returns 0 if currency is not cUSD', async () => {
      await expect(
        getPaymentAmount(
          "0x43367d0f5120f67c97befbc810a101c6402eec3c02e406f3fd3bf6d9b1a4e452", 
          "0x98db3a41bf8bf4ded2c92a84ec0705689ddeef8b",
          "0xDB0415E1D7f9A42633076CBD40BE5Eeb15cc700d"
          )
      ).resolves.toMatchObject(BigNumber.from("0"))
    })

    // https://explorer.celo.org/tx/0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a/token-transfers
    it('Returns 0 if payer does not match', async () => {
      await expect(
        getPaymentAmount(
          "0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a", 
          "0x98db3a41bf8bf4ded2c92a84ec0705689ddeef8b",
          "0x765DE816845861e75A25fCA122bb6898B8B1282a"
          )
      ).resolves.toMatchObject(BigNumber.from("0"))
    })

    // https://explorer.celo.org/tx/0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a/token-transfers
    it('Returns 0 if payee does not match', async () => {
      await expect(
        getPaymentAmount(
          "0xcdf20f44b4c69615c6ba857b220faf53502583b6f74a654746aa1958ecd9ed5a", 
          "0x7207c4e548b4d1179f5732a1faa2b61b714cb3e2",
          "0xDB0415E1D7f9A42633076CBD40BE5Eeb15cc700d"
          )
      ).resolves.toMatchObject(BigNumber.from("0"))
    })
  })

  
describe.only(createPayment, () => {
  jest.setTimeout(10000);
  it('Returns txHash as paymentId and can be verified', async () => {
    const web3 = new Web3("https://forno.celo.org");
    // Fund printed out account with CELO + cUSD
    const privateKey = "YOUR_KEY_HERE"
    const currGasPrice = "110800000"
    console.log(web3.eth.accounts.wallet.add(privateKey))
    web3.eth.defaultAccount = "0x8b3afe04fdDd4F4c40cE61c326F136Fa178eA0a8"
    const toAddress = "0x7207c4e548b4d1179f5732a1faa2b61b714cb3e2"
    const paymentAmount = BigNumber.from(10)
    const paymentId = await createPayment(web3, toAddress, paymentAmount, { gasPrice: currGasPrice })
    console.log(paymentId)

    // Verify tx    
    await expect(
      getPaymentAmount(
        paymentId,
        web3.eth.defaultAccount,
        toAddress
        )
    ).resolves.toMatchObject(paymentAmount)
  })
})