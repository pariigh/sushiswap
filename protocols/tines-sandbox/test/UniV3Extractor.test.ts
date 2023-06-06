import { erc20Abi } from '@sushiswap/abi'
import { ChainId } from '@sushiswap/chain'
import { DAI, USDC, WBTC, WETH9, WNATIVE } from '@sushiswap/currency'
import { PoolInfo, UniV3Extractor } from '@sushiswap/extractor'
import { PoolCode, UniswapV3Provider } from '@sushiswap/router'
import { UniV3Pool } from '@sushiswap/tines'
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { expect } from 'chai'
import { network } from 'hardhat'
import { HardhatNetworkAccountUserConfig } from 'hardhat/types'
import { Address, createPublicClient, createWalletClient, custom, CustomTransport, WalletClient } from 'viem'
import { Account, privateKeyToAccount } from 'viem/accounts'
import { Chain, hardhat } from 'viem/chains'

import { setTokenBalance } from '../src'
import { comparePoolCodes } from '../src/ComparePoolCodes'

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

const pools: PoolInfo[] = [
  {
    address: '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168',
    token0: DAI[ChainId.ETHEREUM],
    token1: USDC[ChainId.ETHEREUM],
    fee: 100,
  },
  {
    address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    token0: USDC[ChainId.ETHEREUM],
    token1: WNATIVE[ChainId.ETHEREUM],
    fee: 500,
  },
  {
    address: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
    token0: WBTC[ChainId.ETHEREUM],
    token1: WNATIVE[ChainId.ETHEREUM],
    fee: 3000,
  },
]

const poolSet = new Set(pools.map((p) => p.address.toLowerCase()))
const NonfungiblePositionManagerAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' as '0x${string}'

interface TestEnvironment {
  account: Account
  chain: Chain
  transport: CustomTransport
  client: WalletClient
  user: Address
}

async function prepareEnvironment(): Promise<TestEnvironment> {
  const privateKey = (network.config.accounts as HardhatNetworkAccountUserConfig[])[0].privateKey as '0x${string}'
  const account = privateKeyToAccount(privateKey)
  const chain: Chain = {
    ...hardhat,
    contracts: {
      multicall3: {
        address: '0xca11bde05977b3631167028862be2a173976ca11',
        blockCreated: 14353601,
      },
    },
  }
  const transport = custom(network.provider)
  const client = createWalletClient({
    chain,
    transport,
    account,
  })
  const [user] = await client.getAddresses()

  const tokens = [DAI[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], WNATIVE[ChainId.ETHEREUM], WBTC[ChainId.ETHEREUM]]
  await Promise.all(
    tokens.map(async (t) => {
      await setTokenBalance(t.address, user, BigInt(1e24))
      await client.writeContract({
        address: t.address as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [NonfungiblePositionManagerAddress as Address, BigInt(1e24)],
      })
    })
  )

  return {
    account,
    chain,
    transport,
    client,
    user,
  }
}

async function Mint(env: TestEnvironment, pc: PoolCode, tickLower: number, tickUpper: number, liquidity: bigint) {
  const MintParams = {
    token0: pc.pool.token0.address,
    token1: pc.pool.token1.address,
    fee: pc.pool.fee * 1e6,
    tickLower,
    tickUpper,
    amount0Desired: liquidity,
    amount1Desired: liquidity,
    amount0Min: 0,
    amount1Min: 0,
    recipient: env.user,
    deadline: 1e12,
  }
  await env.client.writeContract({
    account: env.user,
    chain: env.chain,
    address: NonfungiblePositionManagerAddress as Address,
    abi: INonfungiblePositionManager.abi,
    functionName: 'mint',
    args: [MintParams],
  })
}

describe('UniV3Extractor', () => {
  let env: TestEnvironment

  before(async () => {
    env = await prepareEnvironment()
  })

  it('pools downloading', async () => {
    const client = createPublicClient({
      chain: env.chain,
      transport: env.transport,
    })

    const extractor = new UniV3Extractor(client, 'UniswapV3', '0xbfd8137f7d1516d3ea5ca83523914859ec47f573')
    extractor.start(pools)

    const uniProvider = new UniswapV3Provider(ChainId.ETHEREUM, client)
    await uniProvider.fetchPoolsForToken(USDC[ChainId.ETHEREUM], WETH9[ChainId.ETHEREUM], {
      has: (poolAddress: string) => !poolSet.has(poolAddress.toLowerCase()),
    })
    const providerPools = uniProvider.getCurrentPoolList()

    for (;;) {
      if (extractor.getStablePoolCodes().length == pools.length) break
      await delay(500)
    }
    const extractorPools = extractor.getStablePoolCodes()

    providerPools.forEach((pp) => {
      const ep = extractorPools.find((p) => p.pool.address == pp.pool.address)
      expect(ep).not.undefined
      if (ep) comparePoolCodes(pp, ep)
    })
  })

  it('mint event', async () => {
    const testPools = pools.slice(0, 1)
    const client = createPublicClient({
      chain: env.chain,
      transport: env.transport,
    })

    const extractor = new UniV3Extractor(client, 'UniswapV3', '0xbfd8137f7d1516d3ea5ca83523914859ec47f573')
    extractor.start(testPools)
    for (;;) {
      if (extractor.getStablePoolCodes().length == testPools.length) break
      await delay(500)
    }

    let extractorPools = extractor.getStablePoolCodes()
    const tinesPool = extractorPools[0].pool as UniV3Pool
    const currentTick = tinesPool.ticks[tinesPool.nearestTick].index
    await Mint(env, extractor.getStablePoolCodes()[0], currentTick - 600, currentTick + 600, BigInt(1e8))
    const blockNumber = await client.getBlockNumber()
    for (;;) {
      if (extractor.lastProcessdBlock == blockNumber) break
      await delay(500)
    }

    const uniProvider = new UniswapV3Provider(ChainId.ETHEREUM, client)
    await uniProvider.fetchPoolsForToken(USDC[ChainId.ETHEREUM], WETH9[ChainId.ETHEREUM], {
      has: (poolAddress: string) => !poolSet.has(poolAddress.toLowerCase()),
    })
    const providerPools = uniProvider.getCurrentPoolList()

    extractorPools = extractor.getStablePoolCodes()
    providerPools.forEach((pp) => {
      if (pp.pool.address !== tinesPool.address) return
      const ep = extractorPools.find((p) => p.pool.address == pp.pool.address)
      expect(ep).not.undefined
      if (ep) comparePoolCodes(pp, ep)
    })
  })
})
