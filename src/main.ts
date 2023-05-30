import * as XLSX from "xlsx";
import * as fs from 'node:fs/promises';



const hkListingURL =
  "https://www2.hkexnews.hk/-/media/HKEXnews/Homepage/Others/Quick-Link/Homepage/Other-Useful-Information/Hyperlinks-to-Listed-Co.xlsx";

const fetching = fetch(hkListingURL).then((data) => {
  const arrayBuffer = data.arrayBuffer().then((data) => {
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]]
    let beginRow = 1;
  //+ 1 is to ensure the max number of row is correct
  const targetLength = XLSX.utils.decode_range(ws["!ref"]!!).e.r + 1;
  while (beginRow <= targetLength) {
    if (ws[`A${beginRow}`] !== undefined) {
      if (ws[`A${beginRow}`]["v"] === 1) break;
    }
    beginRow++;
  }
  let n = beginRow;
  const dataContainer = [];
  while (n <= targetLength) {
    dataContainer.push({
      symbol: ws[`A${n}`]["v"],
      engName: ws[`B${n}`]["v"],
      zhName: ws[`C${n}`]["v"],

    });

    n++;}
    return dataContainer
  });

return arrayBuffer
});
console.log("-----------", fetching.then(data=>console.log(data)
));


// A Promise that resolves with  data
const dataPromise = Promise.resolve(fetching);

// Wait for the Promise to resolve and store the data in a JSON file
dataPromise.then(data => {
  fs.writeFile('../data.json', JSON.stringify(data));
}).catch(err => {
  console.error(err);
});