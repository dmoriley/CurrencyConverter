/**
 * Convert the value to the desired currency based on the rate supplied
 * @param {*Number} value Value to convert from
 * @param {*Number} rate Currency rate to use in conversion
 */
const calculateConvertedAmount = function(value, rate) {
    console.log(`Value: ${value}, Rate: ${rate}`);
    return (value * rate).toFixed(2);
}