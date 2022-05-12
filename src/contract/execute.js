import { LCDClient, MsgExecuteContract, Fee } from "@terra-money/terra.js";
import { contractAddress } from "./address";

// ==== utils ====

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const until = Date.now() + 1000 * 60 * 60;
const untilInterval = Date.now() + 1000 * 60;

const _exec =
  (msg, fee = new Fee(400000, { uluna: 10000 })) =>
    async (wallet, mintNum) => {
      // console.log('wallet: ', wallet)
      const lcd = new LCDClient({
        URL: wallet.network.lcd,
        chainID: wallet.network.chainID,
      });

      let tempMsgs = []
      for (let i = 0; i < mintNum; i++) {
        let tempMsg = new MsgExecuteContract(
          wallet.walletAddress,
          contractAddress(wallet),
          msg
        )
        tempMsgs.push(tempMsg)
      }

      let result
      try {
        result = (await wallet.post({
          fee,
          msgs: tempMsgs
        })).result
        console.log('result:', result)
      } catch (err) {
        console.log('error minting:', err.name)
        return err.name
      }

      while (true) {
        try {
          return await lcd.tx.txInfo(result.txhash);
        } catch (e) {
          // console.log('error: ', e)
          // throw new Error(
          //   `Transaction queued. To verify the status, please check the transaction hash: ${result.txhash}`
          // );
          if (Date.now() < untilInterval) {
            await sleep(500);
          } else if (Date.now() < until) {
            await sleep(1000 * 10);
          } else {
            console.log(e)
            throw new Error(
              `Transaction queued. To verify the status, please check the transaction hash: ${result.txhash}`
            );
          }
        }
      }
    };

// ==== execute contract ====

export const mint = async (wallet, tokenUri, mintNum) => _exec(
  {
    mint: {
      token_uri: tokenUri
      // owner: owner_address,
      // token_id: token_id,
      // extension: {
      //   name: nft_name,
      //   image: image_url,
      // },
    }
  })(wallet, mintNum);
