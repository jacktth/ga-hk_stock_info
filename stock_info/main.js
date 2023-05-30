"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XLSX = require("xlsx");
var fs = require("node:fs/promises");
var hkListingURL = "https://www2.hkexnews.hk/-/media/HKEXnews/Homepage/Others/Quick-Link/Homepage/Other-Useful-Information/Hyperlinks-to-Listed-Co.xlsx";
var fetching = fetch(hkListingURL).then(function (data) {
    var arrayBuffer = data.arrayBuffer().then(function (data) {
        var wb = XLSX.read(data);
        var ws = wb.Sheets[wb.SheetNames[0]];
        var beginRow = 1;
        //+ 1 is to ensure the max number of row is correct
        var targetLength = XLSX.utils.decode_range(ws["!ref"]).e.r + 1;
        while (beginRow <= targetLength) {
            if (ws["A".concat(beginRow)] !== undefined) {
                if (ws["A".concat(beginRow)]["v"] === 1)
                    break;
            }
            beginRow++;
        }
        var n = beginRow;
        var dataContainer = [];
        while (n <= targetLength) {
            dataContainer.push({
                symbol: ws["A".concat(n)]["v"],
                engName: ws["B".concat(n)]["v"],
                zhName: ws["C".concat(n)]["v"],
            });
            n++;
        }
        return dataContainer;
    });
    return arrayBuffer;
});
// A Promise that resolves with  data
var dataPromise = Promise.resolve(fetching);
// Wait for the Promise to resolve and store the data in a JSON file
dataPromise.then(function (data) {
    fs.writeFile('./stock_info/date.json', JSON.stringify(data));
}).catch(function (err) {
    console.error("err", err);
});
