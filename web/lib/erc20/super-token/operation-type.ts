import { encodeAbiParameters, parseAbiParameters } from "viem"

// TODO: Add more comments here?

export const OPERATION_TYPE = {
  UNSUPPORTED: 0,
  ERC20_APPROVE: 1,
  ERC20_TRANSFER_FROM: 2,
  /** @deprecated Prefer ERC20 transfer. */
  ERC777_SEND: 3,
  ERC20_INCREASE_ALLOWANCE: 4,
  ERC20_DECREASE_ALLOWANCE: 5,
  SUPERTOKEN_UPGRADE: 101,
  SUPERTOKEN_DOWNGRADE: 102,
  SUPERFLUID_CALL_AGREEMENT: 201, // The main operation type for agreement calls like: CFA.createFlow & GDA.createPool
  CALL_APP_ACTION: 202,
  SIMPLE_FORWARD_CALL: 301,
  ERC2771_FORWARD_CALL: 302,
} as const

export type OperationType = (typeof OPERATION_TYPE)[keyof typeof OPERATION_TYPE]

export type Operation = {
  operationType: OperationType
  target: `0x${string}`
  data: `0x${string}`
}

export const stripFunctionSelector = (callData: `0x${string}`) =>
  "0x".concat(callData.slice(10)) as `0x${string}`

type PrepareOperationDataArgs<T extends OperationType> =
  T extends typeof OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT
    ? { operationType: T; data: `0x${string}`; userData?: `0x${string}` }
    : { operationType: T; data: `0x${string}` }

export function prepareOperationData<T extends OperationType>({
  operationType,
  data,
  ...rest
}: PrepareOperationDataArgs<T>) {
  switch (operationType) {
    case OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT: {
      const userData = (rest as { userData?: `0x${string}` }).userData ?? "0x"
      return encodeAbiParameters(parseAbiParameters("bytes, bytes"), [data, userData])
    }
    case OPERATION_TYPE.CALL_APP_ACTION:
    case OPERATION_TYPE.SIMPLE_FORWARD_CALL:
    case OPERATION_TYPE.ERC2771_FORWARD_CALL:
      return data
    case OPERATION_TYPE.ERC20_APPROVE:
    case OPERATION_TYPE.ERC20_TRANSFER_FROM:
    case OPERATION_TYPE.ERC777_SEND:
    case OPERATION_TYPE.ERC20_INCREASE_ALLOWANCE:
    case OPERATION_TYPE.ERC20_DECREASE_ALLOWANCE:
    case OPERATION_TYPE.SUPERTOKEN_UPGRADE:
    case OPERATION_TYPE.SUPERTOKEN_DOWNGRADE:
      return stripFunctionSelector(data)
    default:
      throw new Error(`Unsupported operation type: ${operationType}`)
  }
}

type PrepareOperationArgs<T extends OperationType> = {
  target: `0x${string}`
} & PrepareOperationDataArgs<T>

export function prepareOperation<T extends OperationType>(
  args: PrepareOperationArgs<T>,
): Operation {
  const { operationType, target, data, ...rest } = args
  return {
    operationType,
    target,
    data: prepareOperationData({ operationType, data, ...rest }),
  }
}

export const TIME_UNIT = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
  month: 2628000,
  year: 31536000,
} as const

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT]
