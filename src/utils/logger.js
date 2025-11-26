function log(...args) {
    console.log("[TinyLink]", ...args);
}

function error(...args) {
    console.error("[TinyLink:ERROR]", ...args);
}

module.exports = { log, error };
