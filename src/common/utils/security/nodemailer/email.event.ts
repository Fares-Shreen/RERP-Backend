import EventEmitter from "node:events";

export const eventEmitter = new EventEmitter();
export const email_event_name = "sendEmail";
export const emailEventEmitter = 
    eventEmitter.on(email_event_name, async (fn) => {
        return fn();
    });
    
