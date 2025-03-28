/**
 * @fileoverview Enumerate the log events.
 */

const consts = (module.exports = {});

consts.LogEvents = {
  DECISION_ENDED: 'decisionEnd',
  STAYING_COURSE: 'stayingCourse',
  CUTTING_LOSSES: 'cuttingLosses',
  HEARTBEAT_UPDATE: 'heartbeatUpdate',
  ROAM_TRADE_EVENT_HANDLED: 'roamTradeEventHandled',
};
