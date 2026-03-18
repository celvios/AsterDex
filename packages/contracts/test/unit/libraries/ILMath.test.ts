import { expect } from "chai";
import { ethers } from "hardhat";

describe("ILMath", function () {
    let ilMathTest: any;

    before(async function () {
        // Deploy a test wrapper since ILMath is a library
        const ILMathTestFactory = await ethers.getContractFactory("ILMathTest");
        ilMathTest = await ILMathTestFactory.deploy();
        await ilMathTest.waitForDeployment();
    });

    describe("computeILBps", function () {
        it("should return 0 when entry rate is zero", async function () {
            const result = await ilMathTest.computeILBps(0, 1000000000000000000n);
            expect(result).to.equal(0);
        });

        it("should return 0 when current rate equals entry rate", async function () {
            const rate = ethers.parseEther("1.0");
            const result = await ilMathTest.computeILBps(rate, rate);
            expect(result).to.equal(0);
        });

        it("should return non-zero IL when price moves up", async function () {
            const entryRate = ethers.parseEther("1.0");
            const currentRate = ethers.parseEther("2.0"); // 2x price increase
            const result = await ilMathTest.computeILBps(entryRate, currentRate);
            // IL at 2x should be ~5.72% = ~572 bps
            expect(result).to.be.gt(500);
            expect(result).to.be.lt(650);
        });

        it("should return non-zero IL when price moves down", async function () {
            const entryRate = ethers.parseEther("2.0");
            const currentRate = ethers.parseEther("1.0"); // 50% price drop
            const result = await ilMathTest.computeILBps(entryRate, currentRate);
            // IL at 0.5x should also be ~5.72%
            expect(result).to.be.gt(500);
            expect(result).to.be.lt(650);
        });

        it("should return higher IL for larger price divergence", async function () {
            const entryRate = ethers.parseEther("1.0");
            const smallMove = ethers.parseEther("1.5");
            const bigMove = ethers.parseEther("4.0");

            const ilSmall = await ilMathTest.computeILBps(entryRate, smallMove);
            const ilBig = await ilMathTest.computeILBps(entryRate, bigMove);

            expect(ilBig).to.be.gt(ilSmall);
        });

        it("should return 0 for very small price movements", async function () {
            const entryRate = ethers.parseEther("1.0");
            const currentRate = ethers.parseEther("1.001"); // 0.1% move
            const result = await ilMathTest.computeILBps(entryRate, currentRate);
            // Should be essentially 0 or very small
            expect(result).to.be.lt(5);
        });
    });

    describe("computeILUSDC", function () {
        it("should return 0 when no IL", async function () {
            const rate = ethers.parseEther("1.0");
            const result = await ilMathTest.computeILUSDC(1000000n, rate, rate);
            expect(result).to.equal(0);
        });

        it("should scale IL to position size", async function () {
            const entryRate = ethers.parseEther("1.0");
            const currentRate = ethers.parseEther("2.0");

            const il100 = await ilMathTest.computeILUSDC(100_000_000n, entryRate, currentRate);
            const il1000 = await ilMathTest.computeILUSDC(1_000_000_000n, entryRate, currentRate);

            // IL on 1000 USDC should be 10x IL on 100 USDC
            expect(il1000).to.be.closeTo(il100 * 10n, il100); // 10% tolerance
        });
    });

    describe("sqrt edge cases", function () {
        it("should handle sqrt of 0", async function () {
            const result = await ilMathTest.computeILBps(0, 0);
            expect(result).to.equal(0);
        });

        it("should handle very large exchange rates", async function () {
            const entryRate = ethers.parseEther("1.0");
            const currentRate = ethers.parseEther("100.0"); // 100x
            const result = await ilMathTest.computeILBps(entryRate, currentRate);
            // IL should be significant but bounded
            expect(result).to.be.gt(0);
            expect(result).to.be.lt(10000); // can't exceed 100%
        });
    });
});
