
module.exports = {
    getAverageDuration: (times) => {
        return new Promise((resolve, reject) => {
            if(times.length < 2){
                resolve(0);
            } else {
                times = times.sort((a,b) => { return new Date(a)>new Date(b); });
                console.log(times);
                var timeDiffs = [];
                for (var i = 1; i < times.length; i++){
                    var d = Math.abs(new Date(times[i]) - new Date(times[i - 1]));
                    var minutes = d / (1000*60);
                    console.log(minutes);
                    timeDiffs.push(minutes);
                }
                console.log(timeDiffs);
                var sum = timeDiffs.reduce((a,b)=> { return a+b;} );
                var avg = sum / timeDiffs.length;
                resolve(avg);
            }
        });
    },

};
