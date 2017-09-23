var path = require('path');
var lineReader = require('line-reader');

var dateFormat = require('dateformat');


const jsonDataArray = []


const SQL_FILE = 'sign_in_test.sql';
// const SQL_FILE = 'sign_in_bak.sql';
lineReader.eachLine(path.join(__dirname, SQL_FILE), function (line, last) {
    // console.log(line);
    const items = line.split(',');
    // console.log(items) // 11 12
    if (items[11] && items[12]) {
        var bdpoint = bd_encrypt(items[12], items[11])
        items[11] = bdpoint['bd_lat']
        items[12] = bdpoint['bd_lon']
        jsonDataArray.push({
            'point': [items[12], items[11]].join(','),
            'title': eval(items[6]) + ' (' + eval(items[7]) + ')',
            'time': dateFormat(new Date(Number(items[1])), "yyyy-mm-dd h:MM:ss")
        })
    }
    // do whatever you want with line...
    if (last) {
        // or check if it's the last one
        console.log('last:', JSON.stringify(jsonDataArray))
        writeDatas()
    }
});


/**
 * 火星坐标系转百度坐标系
 * @param gg_lon
 * @param gg_lat
 * @return {{bd_lat: number, bd_lon: number}}
 */
function bd_encrypt(gg_lon, gg_lat) {
    gg_lon = Number(gg_lon)
    gg_lat = Number(gg_lat)
    var X_PI = Math.PI * 3000.0 / 180.0;
    var x = gg_lon, y = gg_lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    var bd_lon = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return {
        bd_lat: bd_lat,
        bd_lon: bd_lon
    };
}

const MAX_COUNT = 100;

function writeDatas() {
    var fs = require('fs');

    var data = jsonDataArray;

    if (MAX_COUNT > 0) {
        data = jsonDataArray.slice(0, MAX_COUNT)
    }
    fs.writeFile(path.join(__dirname, "../gen/data.json"), JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}
