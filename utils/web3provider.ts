import { ethers } from "ethers";
require("dotenv").config()


const provider = new ethers.providers.JsonRpcProvider(process.env.rpc,
{
  chainId: 97,
  name:"bsctestnet",
}

)

const walletkey = process.env.walletkey!;
export const wallet  = new ethers.Wallet(walletkey,provider);


