var _ = require('lodash');

module.exports = (array, getDate) => {

    function getNextGroup(item, array){
        var date = getDate(item);
        var similarDates = sortedArray.filter((i) => {
            var diff = date-getDate(i);
            return Math.abs(diff) < (1000*60*60*hours);
        });
        return {key: date, group: similarDates};
    }
    var hours = 1.5;
    var sortedArray = array.sort((i) => { return getDate(i)});
    var groups = [];
    var loops = 0
    while(sortedArray.length > 0 && loops < 20){
        console.log(sortedArray.length);
        var group = getNextGroup(sortedArray[0], sortedArray);
        groups.push(group);
        sortedArray = sortedArray.filter((i) => {
            return group.group.indexOf(i) < 0;
        });
        loops = loops + 1;
    }
    return groups;
};