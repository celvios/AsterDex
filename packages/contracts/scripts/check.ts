import { ethers } from "hardhat";
async function main() {
    const code = await ethers.provider.getCode("0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d");
    console.log("USDC code length:", code.length);
    const bn = await ethers.provider.getBlockNumber();
    console.log("Block number:", bn);
}
main();
