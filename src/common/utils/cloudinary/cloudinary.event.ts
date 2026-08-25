import EventEmitter from "node:events";
export const  SEND_CLOUDINARY_EVENT = "sendCloudinaryEvent;"
export const eventEmitter = new EventEmitter();

export const cloudinaryEventEmitter = 
    eventEmitter.on(SEND_CLOUDINARY_EVENT, async (fn) => {
        return fn();
    });
    
