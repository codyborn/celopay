# CeloPay Point-of-Sale Library

This is a simple utility library to facilitate cUSD point of sale payments on the Celo network. CeloPay follows a simple payment flow where a client (ex. web browser) is making a cUSD payment to a server (ex. off-chain web store).

Note that this library requires the user to track state for accounts and paymentIds. It's highly recommended to authenticate the user to ensure they own the account they're paying with (see EIP-712). This prevents a user from claiming someone else's payment as their own. Additionally, to ensure that you don't double count a payment in your database, create a lock on the paymentId to prevent a separate server from processing the same payment.  

1. Client sends payment and receives paymentId
```
var toAddress = "0x..." // the server's Celo wallet or multisig
var paymentAmount = 1000000000000000000 // $1 in cUSD, note 18 decimal places
// the web3 should be retrieved using WalletConnect or similar
const paymentId = await createPayment(web3, toAddress, paymentAmount)
```

2. Client sends paymentId and their Celo address to the server. This can be done with a regular POST request to your server API.


3. Server verifies payment, marking the paymentId as consumed and incrementing the client's balance in the database.
```
var fromAddress = "0x..." // client's wallet address
var paymentId = "0x..." // response from createPayment() on the client
var toAddress = "0x..." // the server's Celo wallet or multisig

// Lock paymentId in your database to prevent payment double counting
// Note that paymentIds will be unique per tx

// Check if paymentId is consumed in your DB

// response will be a BigNumber with 18 decimal places
const amountReceived = await getPaymentAmount(
        paymentId,
        fromAddress,
        toAddress
        )

// Mark paymentId as consumed in DB
// Increment account's balance

```

