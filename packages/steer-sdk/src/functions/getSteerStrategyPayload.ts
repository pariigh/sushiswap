import { isPromiseFulfilled } from '@sushiswap/validate'
import { fetch } from '@whatwg-node/fetch'

interface Payload {
  strategyConfigData: {
    period: number
    standardDeviations: number
    poolFee: number
    epochStart: number
    epochLength: string
    name: string
    description: string
    appImgUrl: string
  }
  vaultPayload: {
    fee: number
    slippage: number
    ratioErrorTolerance: number
    maxTicksChange: number
    twapInterval: number
  }
}

interface GetSteerPayloads {
  payloadHashes: string[]
}

async function getSteerPayloads({ payloadHashes }: GetSteerPayloads) {
  const results = await Promise.allSettled(
    payloadHashes.map(async (payloadHash) => {
      return fetch(`https://ipfs.io/ipfs/${payloadHash}`).then((res) => res.json() as Promise<Payload>)
    })
  )

  return results.map((r) => (isPromiseFulfilled(r) ? r.value : null))
}

interface GetSteerPayload {
  payloadHash: string
}

async function getSteerPayload({ payloadHash }: GetSteerPayload) {
  return (await getSteerPayloads({ payloadHashes: [payloadHash] }))[0]
}

export { getSteerPayload, getSteerPayloads }
