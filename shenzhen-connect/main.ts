import * as XLSX from "xlsx";
import * as fs from 'node:fs/promises';

type Container = {
  symbol: String;
  engName: String;
  zhName: String;
  tradingAvailable: Boolean;
};
const szConnectListingEng =
  "https://www.hkex.com.hk/-/media/HKEX-Market/Mutual-Market/Stock-Connect/Eligible-Stocks/View-All-Eligible-Securities_xls/SZSE_Securities.xls";
const szConnectListingZh =
  "https://www.hkex.com.hk/-/media/HKEX-Market/Mutual-Market/Stock-Connect/Eligible-Stocks/View-All-Eligible-Securities_xls/SZSE_Securities_c.xls";

const zhResult = fetch(szConnectListingZh).then((data) => {
  const arrayBuffer = data.arrayBuffer().then((data) => {
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    let beginRow = 1;
    //+ 1 is to ensure the max number of row is correct
    const targetLength = XLSX.utils.decode_range(ws["!ref"]!!).e.r + 1;
    while (beginRow <= targetLength) {
      if (ws[`A${beginRow}`] !== undefined) {
        //undefined means there is a blank row
        if (ws[`A${beginRow}`]["v"] === "數目") {
          beginRow++;
          break;
        }
      }
      beginRow++;
    }

    let n = beginRow;
    let dataContainer: any = {};
    while (n <= targetLength) {
      dataContainer = {
        ...dataContainer,
        [ws[`B${n}`]["v"]]: ws[`D${n}`]["v"],
      };

      n++;
    }

    return dataContainer;
  });
  return arrayBuffer;
});

const fetching = fetch(szConnectListingEng).then((data) => {
  const arrayBuffer = data.arrayBuffer().then((data) => {
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    let beginRow = 1;
    //+ 1 is to ensure the max number of row is correct
    const targetLength = XLSX.utils.decode_range(ws["!ref"]!!).e.r + 1;
    while (beginRow <= targetLength) {
      if (ws[`A${beginRow}`] !== undefined) {
        //undefined means there is a blank row
        if (ws[`A${beginRow}`]["v"] === "No.") {
          beginRow++;
          break;
        }
      }
      beginRow++;
    }
    let n = beginRow;

    const dataContainer: Container[] = [];
    zhResult.then((zhData) => {

      while (n <= targetLength) {
        dataContainer.push({
          symbol: ws[`B${n}`]["v"].toString().padStart(6, '0'),
          engName: ws[`D${n}`]["v"],
          zhName: zhData[`${ws[`B${n}`]["v"]}`],
          tradingAvailable: ws[`A${n}`]["v"] === "Buy Suspended" ? false : true,
        });

        n++;
      }
    });

    return dataContainer;
  });

  return arrayBuffer;
});

// A Promise that resolves with  data
const dataPromise = Promise.resolve(fetching);

// Wait for the Promise to resolve and store the data in a JSON file
dataPromise.then(data => {
  fs.writeFile('date.json', JSON.stringify(data));
}).catch(err => {
  console.error("err",err);
});
