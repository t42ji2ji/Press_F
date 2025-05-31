import dotenv from "dotenv";
dotenv.config();

import { deployToken } from "./utils";

(async () => {
  const name = "Crypto is still here";
  const symbol = "HERE";
  const xUrl = "https://x.com/cz_binance/status/1928211000190259581";
  const xUser = "cz_binance";
  try {
    const result = await deployToken(name, symbol, xUrl, xUser);
    console.log("Deployed token:", result);
  } catch (e) {
    console.error(e);
  }
})();
