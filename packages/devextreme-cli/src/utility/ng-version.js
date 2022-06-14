const semver = require('semver').SemVer;
const execSync = require('child_process').execSync;

function parseNgCliVersion(stdout) {
    return /angular.cli:\s*(\S+)/ig.exec(stdout)[1];
}

const getLocalNgVersion = () => {
    try {
        const version = parseNgCliVersion(execSync('ng v').toString());
        return new semver(version);
    } catch(e) {
        return '';
    }
};

const getPublicNgVersion = () => {
    const version = execSync('npm view @angular/cli version').toString();
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
