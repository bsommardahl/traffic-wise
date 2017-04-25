module.exports = function(wallaby){
    return {
        "files": [
            "*.js",
            "util/**/*.js",
            "!test/**/*.test.js"
            ],
        "tests": [
            "test/**/*.test.js",
            ],
        "testFramework": "mocha",
        "debug": true,
        "env": { type: "node" }
    };
};