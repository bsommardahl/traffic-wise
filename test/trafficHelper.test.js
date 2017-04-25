var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.should();
chai.use(chaiAsPromised);

describe("trafficHelper", () => {
    var helper = require('../util/trafficHelper');
    describe("getAverageDuration", () => {
        describe("with a few varying movement times", () => {
            it("should return the correct average distance", () => {
                var times = [new Date('1-1-2017 8:30 am'), new Date('1-1-2017 10:45 am'), new Date('1-1-2017 12:30 pm')];
                var outcome = helper.getAverageDuration(times);
                return outcome.should.eventually.equal(120);
            });
        });
        describe("with a several varying movement times", () => {
            it("should return the correct average distance", () => {
                var times = [
                    new Date('1-1-2017 8:30 am'),
                    new Date('1-1-2017 8:35 am'),
                    new Date('1-1-2017 8:40 am'),
                    '1-1-2017 8:45 am',
                    new Date('1-1-2017 8:50 am'),
                    new Date('1-1-2017 8:55 am'),
                    new Date('1-1-2017 9:00 am')
                ];
                var outcome = helper.getAverageDuration(times);
                return outcome.should.eventually.equal(5);
            });
        });
        describe("with only one movement time", () => {
            it("should return zero", () => {
                var times = [
                    new Date('1-1-2017 8:30 am'),
                ];
                var outcome = helper.getAverageDuration(times);
                return outcome.should.eventually.equal(0);
            });
        });
        describe("with unordered movement times", () => {
            it("should return the correct average distance", () => {
                var times = [
                    new Date('1-1-2017 10:45 am'),
                    new Date('1-1-2017 8:30 am'),
                    new Date('1-1-2017 12:30 pm')
                ];
                var outcome = helper.getAverageDuration(times);
                return outcome.should.eventually.equal(120);
            });
        });
    });
});