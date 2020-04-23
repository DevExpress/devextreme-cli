const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.substr(1);
};

const humanize = (str) => {
    return str.split('-').map((part) => capitalize(part)).join(' ');
};

const dasherize = (str) => {
    return decamelize(str).replace(/[ _]/g, '-');
};

const decamelize = (str) => {
    return str.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase();
};

const classify = (str) => {
    return str.split('.').map(part => capitalize(camelize(part))).join('.');
};

const camelize = (str) => {
    return str
        .replace(/(-|_|\.|\s)+(.)?/g, (match, separator, chr) => {
            return chr ? chr.toUpperCase() : '';
        }).replace(/^([A-Z])/, (match) => match.toLowerCase());
};

module.exports = {
    capitalize,
    humanize,
    dasherize,
    classify,
    decamelize
};
