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

const getPublicNgVersion = () => {
    const versions = JSON.parse(execSync('npm view @angular/cli@22 version --json').toString());
    const version = Array.isArray(versions) ? versions[versions.length - 1] : versions;
    return new semver(version);
};

const getNgCliVersion = () => {
    let ngCliVersion = getLocalNgVersion();
    if(!ngCliVersion) {
        ngCliVersion = getPublicNgVersion();
    }

    return ngCliVersion;
};

module.exports = {
    getLocalNgVersion,
    getPublicNgVersion,
    getNgCliVersion
};
