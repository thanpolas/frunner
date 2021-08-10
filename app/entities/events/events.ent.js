/**
 * @fileoverview Main event bus for this project.
 */

const EventEmitter = require('events');

const { eventTypes } = require('./constants/event-types.const');
const { LogEvents } = require('./constants/log-events.const');

const entity = (module.exports = {});

/** @type {events?} Eventemitter instance. */
entity.events = new EventEmitter({ captureRejections: true });

entity.eventTypes = eventTypes;
entity.LogEvents = LogEvents;
