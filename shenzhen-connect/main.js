"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var XLSX = require("xlsx");
var fs = require("node:fs/promises");
var szConnectListingEng = "https://www.hkex.com.hk/-/media/HKEX-Market/Mutual-Market/Stock-Connect/Eligible-Stocks/View-All-Eligible-Securities_xls/SZSE_Securities.xls";
var szConnectListingZh = "https://www.hkex.com.hk/-/media/HKEX-Market/Mutual-Market/Stock-Connect/Eligible-Stocks/View-All-Eligible-Securities_xls/SZSE_Securities_c.xls";
var zhResult = fetch(szConnectListingZh).then(function (data) {
    var arrayBuffer = data.arrayBuffer().then(function (data) {
        var _a;
        var wb = XLSX.read(data);
        var ws = wb.Sheets[wb.SheetNames[0]];
        var beginRow = 1;
        //+ 1 is to ensure the max number of row is correct
        var targetLength = XLSX.utils.decode_range(ws["!ref"]).e.r + 1;
        while (beginRow <= targetLength) {
            if (ws["A".concat(beginRow)] !== undefined) {
                //undefined means there is a blank row
                if (ws["A".concat(beginRow)]["v"] === "數目") {
                    beginRow++;
                    break;
                }
            }
            beginRow++;
        }
        var n = beginRow;
        var dataContainer = {};
        while (n <= targetLength) {
            dataContainer = __assign(__assign({}, dataContainer), (_a = {}, _a[ws["B".concat(n)]["v"]] = ws["D".concat(n)]["v"], _a));
            n++;
        }
        return dataContainer;
    });
    return arrayBuffer;
});
var fetching = fetch(szConnectListingEng).then(function (data) {
    var arrayBuffer = data.arrayBuffer().then(function (data) {
        var wb = XLSX.read(data);
        var ws = wb.Sheets[wb.SheetNames[0]];
        var beginRow = 1;
        //+ 1 is to ensure the max number of row is correct
        var targetLength = XLSX.utils.decode_range(ws["!ref"]).e.r + 1;
        while (beginRow <= targetLength) {
            if (ws["A".concat(beginRow)] !== undefined) {
                //undefined means there is a blank row
                if (ws["A".concat(beginRow)]["v"] === "No.") {
                    beginRow++;
                    break;
                }
            }
            beginRow++;
        }
        var n = beginRow;
        var dataContainer = [];
        zhResult.then(function (zhData) {
            while (n <= targetLength) {
                dataContainer.push({
                    symbol: ws["B".concat(n)]["v"].toString().padStart(6, '0'),
                    engName: ws["D".concat(n)]["v"],
                    zhName: zhData["".concat(ws["B".concat(n)]["v"])],
                    tradingAvailable: ws["A".concat(n)]["v"] === "Buy Suspended" ? false : true,
                });
                n++;
            }
        });
        return dataContainer;
    });
    return arrayBuffer;
});
// A Promise that resolves with  data
var dataPromise = Promise.resolve(fetching);
// Wait for the Promise to resolve and store the data in a JSON file
dataPromise
    .then(function (data) {
    if (data.length === 0) {
        setTimeout(function () {
            var secondPromise = Promise.resolve(fetching);
            secondPromise.then(function (data) {
                fs.writeFile("date.json", JSON.stringify(data));
            });
        }, 5000);
    }
    else {
        fs.writeFile("date.json", JSON.stringify(data));
    }
})
    .catch(function (err) {
    console.error("err", err);
});
