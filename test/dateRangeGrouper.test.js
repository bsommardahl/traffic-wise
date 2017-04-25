var chai = require('chai');
var should = chai.should();

var breakfast = { name: 'breakfast', timestamp: new Date('1-1-2017 8:00 am') };
var lunch = { name: 'lunch', timestamp: new Date('1-1-2017 12:00 pm') };
var lunch2 = { name: 'lunch2', timestamp: new Date('1-1-2017 12:30 pm') };
var lunch3 = { name: 'lunch3', timestamp: new Date('1-1-2017 12:45 pm') };
var snack = { name: 'snack', timestamp: new Date('1-1-2017 3:00 pm') };
var dinner = { name: 'dinner', timestamp: new Date('1-1-2017 6:00 pm') };
var dinner2 = { name: 'dinner2', timestamp: new Date('1-1-2017 6:15 pm') };
var dinner3 = { name: 'dinner3', timestamp: new Date('1-1-2017 6:30 pm') };

describe("dateRangeGrouper", () => {
    var grouper = require('../util/dateRangeGrouper');
    describe("when grouping items by time periods", () => {
        describe("with 2 groups of identical times", () => {
            it("should group items from two time periods by similar dates", () => {
                var outcome = grouper([dinner, dinner, dinner, lunch, lunch], (o) => { return o.timestamp;});
                outcome.length.should.equal(2);
                outcome[0].group.should.deep.equal([lunch, lunch]);
                outcome[1].group.should.deep.equal([dinner, dinner, dinner]);
            });
        });
        describe("with 2 groups of close times", () => {
            it("should group items from two time periods by similar dates", () => {
                var outcome = grouper([dinner, dinner2, dinner3, lunch, lunch2, lunch3], (o) => { return o.timestamp;});
                outcome.length.should.equal(2);
                outcome[0].group.should.deep.equal([lunch3, lunch2, lunch]);
                outcome[1].group.should.deep.equal([dinner3, dinner2, dinner]);
            });
        });
        describe("with 4 groups", () => {
            it("should group items from two time periods by similar dates", () => {
                var outcome = grouper([dinner, dinner, dinner, lunch, lunch, breakfast, breakfast, snack, snack], (o) => { return o.timestamp;});
                outcome.length.should.equal(4);
                outcome[0].group.should.deep.equal([snack, snack]);
                outcome[1].group.should.deep.equal([breakfast, breakfast]);
                outcome[2].group.should.deep.equal([lunch, lunch]);
                outcome[3].group.should.deep.equal([dinner, dinner, dinner]);
            });
        });
    });
});