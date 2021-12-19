// Cache
const Emit = [];
const registeredEmit = [];

Emit.Trigger = (event, data) => {
    if (!registeredEmit[event]) { return console.log(`Emit: No registered event to trigger (Event: "${event}")`); }
    registeredEmit[event](data);
}

Emit.Register = (event, cb) => {
    registeredEmit[event] = cb;
    console.log(`Emit: Registered event (Event: "${event}")`)
}

// Module Exports
module.exports = Emit;