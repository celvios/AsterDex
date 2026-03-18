import { ethers } from "hardhat";
import { ADDRESSES } from "../../config/addresses";

/// @notice Deploy all APEX contracts in the correct order and wire references
export async function deployFullSystem() {
    const [deployer] = await ethers.getSigners();
    const addrs = ADDRESSES[56];

    // Step 1: Deploy StakingStrategy
    const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
    // Note: vault and compounder addresses not known yet — use deployer as placeholder
    // These will need to be set via a separate init call or redeployed in correct order
    const stakingStrategy = await StakingStrategy.deploy(
        deployer.address, // vault (placeholder)
        deployer.address, // compounder (placeholder)
        addrs.USDC,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.WBNB,
        addrs.PANCAKE_ROUTER
    );
    await stakingStrategy.waitForDeployment();

    // Step 2: Deploy BufferStrategy
    const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
    const bufferStrategy = await BufferStrategy.deploy(
        deployer.address, // vault (placeholder)
        deployer.address, // compounder (placeholder)
        addrs.USDC,
        addrs.ASUSDF,
        addrs.ASUSDF_MINTER,
        addrs.USDF,
        addrs.PANCAKE_ROUTER
    );
    await bufferStrategy.waitForDeployment();

    // Step 3: Deploy APEXBrain
    const APEXBrain = await ethers.getContractFactory("APEXBrain");
    const brain = await APEXBrain.deploy(
        deployer.address, // vault (placeholder)
        await stakingStrategy.getAddress(),
        await bufferStrategy.getAddress(),
        deployer.address  // compounder (placeholder)
    );
    await brain.waitForDeployment();

    // Step 4: Deploy APEXCompounder
    const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
    const compounder = await APEXCompounder.deploy(
        deployer.address, // vault (placeholder)
        await brain.getAddress(),
        await stakingStrategy.getAddress(),
        await bufferStrategy.getAddress(),
        addrs.USDC,
        addrs.WBNB,
        addrs.USDF,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.ASUSDF_MINTER,
        addrs.PANCAKE_ROUTER
    );
    await compounder.waitForDeployment();

    // Step 5: Deploy APEXVault
    const APEXVault = await ethers.getContractFactory("APEXVault");
    const vault = await APEXVault.deploy(
        addrs.USDC,
        await brain.getAddress(),
        await compounder.getAddress(),
        await stakingStrategy.getAddress(),
        await bufferStrategy.getAddress(),
        addrs.TREASURY
    );
    await vault.waitForDeployment();

    // TODO: Step 6 — Wire vault/compounder references into strategies and brain
    // This requires setter functions that aren't in the immutable-only design
    // For fork tests, redeploy with correct addresses or use a factory pattern

    return {
        vault,
        brain,
        compounder,
        stakingStrategy,
        bufferStrategy,
        deployer,
        addresses: addrs,
    };
}
