import dotenv from "dotenv";
dotenv.config();

import { suggestToken } from "./utils";

(async () => {
  const testText =
    "When you press F to pay respects and the whole internet joins in. #PressF";
  try {
    const result = await suggestToken(testText);
    console.log("Suggested token:", result);
  } catch (e) {
    console.error(e);
  }
})();
