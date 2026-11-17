const semver = require('semver').SemVer;
const execSync = require('child_process').execSync;

function parseNgCliVersion(stdout) {
    return stdout.trim();
}

const getLocalNgVersion = () => {
    try {
        const version = parseNgCliVersion(execSync('ng --version').toString());
        return new semver(version);
    } catch(e) {
        return '';
    }
};

module.exports = {
    getLocalNgVersion
};
