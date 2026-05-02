import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const MockERC20 = await ethers.getContractFactory("MockERC20");

  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();

  const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();

  const mintAmount = ethers.parseUnits("10000", 6);
  await usdc.mint(deployer.address, mintAmount);
  await usdt.mint(deployer.address, mintAmount);

  console.log(`USDC deployed: ${usdcAddress}`);
  console.log(`USDT deployed: ${usdtAddress}`);
  console.log(`Minted 10,000 USDC and 10,000 USDT to ${deployer.address}\n`);

  console.log("--- Copy to backend/.env ---");
  console.log(`CHAIN=local`);
  console.log(`RPC_URL=http://127.0.0.1:8545`);
  console.log(`USDC_ADDRESS=${usdcAddress}`);
  console.log(`USDT_ADDRESS=${usdtAddress}\n`);

  console.log("--- Copy to frontend/.env ---");
  console.log(`NEXT_PUBLIC_CHAIN_ID=31337`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_USDT_ADDRESS=${usdtAddress}`);

  fs.writeFileSync(
    path.join(__dirname, "../deployed.json"),
    JSON.stringify({ usdc: usdcAddress, usdt: usdtAddress, deployer: deployer.address }, null, 2)
  );
}

main().catch(console.error);
