import EventEmitter from "node:events";

export const eventEmitter = new EventEmitter();

export const emailEventEmitter = 
    eventEmitter.on(process.env.SEND_EMAIL_EVENT as string, async (fn) => {
        return fn();
    });
    
