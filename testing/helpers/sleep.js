module.exports = async(ms) => {
    await new Promise(resolve => setTimeout(resolve, ms));
};
