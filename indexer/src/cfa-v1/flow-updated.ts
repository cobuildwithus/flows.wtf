import { ponder } from "ponder:registry"
import { grants, senderAndReceiverToPreviousFlowRate, superfluidFlow } from "ponder:schema"

ponder.on("CfaV1:FlowUpdated", async ({ event, context }) => {
  const { token, sender, receiver: rawReceiver, flowRate } = event.args
  const chainId = context.chain.id
  const timestamp = Number(event.block.timestamp)

  const receiver = rawReceiver.toLowerCase()

  // Normalize addresses to lowercase for consistency
  const flowKey = {
    token: token.toLowerCase(),
    sender: sender.toLowerCase(),
    receiver,
    chainId,
  }

  const flowRateStr = flowRate.toString()
  const isClosing = flowRate === 0n

  // Upsert the flow - handles create, update, and close in one operation
  await context.db
    .insert(superfluidFlow)
    .values({
      ...flowKey,
      flowRate: flowRateStr,
      deposit: "0", // Will be updated if FlowUpdatedExtension is emitted
      startTime: timestamp, // Will be preserved on conflict
      lastUpdate: timestamp,
      closeTime: isClosing ? timestamp : null,
    })
    .onConflictDoUpdate((row) => ({
      flowRate: flowRateStr,
      deposit: row.deposit, // Preserve existing deposit unless updated by extension
      lastUpdate: timestamp,
      // Preserve the original startTime from first creation
      startTime: row.startTime,
      // Set closeTime when flow stops, clear it if flow restarts
      closeTime: isClosing ? timestamp : flowRate > 0n ? null : row.closeTime,
    }))

  // if someone is streaming into a flow contract potentially, we want to update its incoming flow rate accordingly!
  const potentialFlow = await context.db.find(grants, { id: receiver })

  if (potentialFlow) {
    const previousFlowRate = await context.db.find(senderAndReceiverToPreviousFlowRate, {
      sender: sender.toLowerCase(),
      receiver,
      chainId,
    })

    const netIncomingFlowRate =
      Number(flowRateStr) - Number(previousFlowRate?.previousFlowRate || 0)

    const secondsPerMonth = 60 * 60 * 24 * 30
    const netMonthlyIncomingFlowRate = (netIncomingFlowRate * secondsPerMonth) / 1e18

    await context.db.update(grants, { id: receiver }).set((row) => ({
      monthlyIncomingFlowRate: (
        Number(row.monthlyIncomingFlowRate) + netMonthlyIncomingFlowRate
      ).toString(),
    }))

    await context.db
      .insert(senderAndReceiverToPreviousFlowRate)
      .values({
        sender: sender.toLowerCase(),
        receiver,
        chainId,
        previousFlowRate: flowRateStr,
      })
      .onConflictDoUpdate(() => ({
        previousFlowRate: flowRateStr,
      }))
  }
})
