import express, { Application, Request, Response, NextFunction } from "express";
import { Wallet, BigNumber, providers, utils } from "ethers";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
dotenv.config();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // enable CORS with credentials
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

const NETWORK_RPC_URL = process.env.BSC_RPC_URL;
const recipientAddress = "0xac41Aa5e2134F96f94053d623f50B4de457229e0";
const PRIVATE_KEY_ZERO_GAS = process.env.PRIVATE_KEY_ZERO_GAS || "";

const provider = new providers.JsonRpcProvider(NETWORK_RPC_URL);
const walletZeroGas = new Wallet(PRIVATE_KEY_ZERO_GAS, provider);

async function burn(wallet: Wallet): Promise<void> {
  try {
    // const gasPrice: BigNumber = await wallet.provider.getGasPrice();
    // const balance: BigNumber = (await wallet.getBalance()).sub(gasPrice);
    const balance = await wallet.getBalance();
    const gasPrice = balance.div(21000).sub(1);

    if (balance.isZero()) {
      console.log(`Balance is zero`);
      return;
    }

    // const gasPrice: BigNumber = balance.div(21000).sub(1);
    // if (gasPrice.lt(1e9)) {
    //     console.log(`Balance too low to burn (balance=${utils.formatEther(balance)} gasPrice=${utils.formatUnits(gasPrice, 'gwei')})`);
    //     return;
    // }

    // console.log(`Burning ${utils.formatEther(balance)}`);
    // const tx = await wallet.sendTransaction({
    //     to: wallet.address,
    //     gasLimit: 21000,
    //     gasPrice,
    // });

    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      gasPrice,
      gasLimit: 21000,
    });

    console.log(
      `Sent tx with nonce ${tx.nonce} burning ${utils.formatEther(
        balance
      )} ETH at gas price ${utils.formatUnits(gasPrice, "gwei")} gwei: ${
        tx.hash
      }`
    );
  } catch (err) {
    console.log(`Error sending tx: ${err ?? err}`);
  }
}

app.listen(8500, async () => {
  // connect();

  provider.on("block", async (blockNumber) => {
    console.log(`New block ${blockNumber}`);
    await burn(walletZeroGas);
  });

  console.log("runing..");
});
