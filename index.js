const admin = require("firebase-admin");
const serviceAccount = require("../mullberry-fb.json");
const fs = require("fs");
const central = require("./mbfetch.js");
const prompt = require("prompt-sync")();
var moment = require("moment");
//HELLO
const createDates = (callback) => {
  const currList = ["USD", "EUR", "AUD", "CAD", "RUB", "CNY", "SAR"];
  let years = [];
  for (y = 1998; y < 2021; y++) {
    years.push(y);
  }
  const dateGroups = years.map((year) => {
    return { start: `01-01-${year}`, finish: `01-01-${year + 1}` };
  });
  callback(dateGroups, currList, chooseCurrency);
};

const createCurrencies = (dates, currList, callback) => {
  let currencies = [];
  currList.forEach((currency) => {
    currencies.push({
      name: `${currency}toTL`,
      key: `TP_DK_${currency}_S_YTL`,
      url: `TP.DK.${currency}.S.YTL`,
    });
  });
  callback(dates, currencies, showCurrencyDetails);
};

const chooseCurrency = (dates, currencies, callback) => {
  console.table(currencies);
  var cur = prompt("Please Enter Index of Currency for Details?");
  if (cur !== parseInt(cur).toString()) {
    console.log("please enter a number");
    cur = prompt("Please Enter Index of Currency for Details?");
  }
  if (cur > currencies.length - 1) {
    console.log("invalid index selection");
    cur = prompt("Please Enter Index of Currency for Details?");
  }
  if (cur < 0) {
    console.log("invalid index selection");
    cur = prompt("Please Enter Index of Currency for Details?");
  }
  callback(dates, currencies, cur, checkFiles);
};

const showCurrencyDetails = (dates, currencies, index, callback) => {
  const currency = currencies[index];
  callback(dates, currency, fetchDatas);
};

const checkFiles = (dates, currency, callback) => {
  const curname = currency.key;
  //console.log(curname);
  let statusList = [];
  dates.forEach((element) => {
    let status = readFile(curname, element.start, element.finish);
    statusList.push(status);
  });
  console.table(statusList);

  var date = prompt("Please Enter Index of Date to Update Currencies");
  if (date !== parseInt(date).toString()) {
    console.log("please enter a number");
    date = prompt("Please Enter Index of Date to Update Currencies");
  }
  if (date > statusList.length - 1) {
    console.log("invalid index selection");
    date = prompt("Please Enter Index of Date to Update Currencies");
  }
  if (date < 0) {
    console.log("invalid index selection");
    date = prompt("Please Enter Index of Date to Update Currencies");
  }
  console.log(
    `preparing to update currencies of ${curname} for ${statusList[date].date}`
  );
  const selectedDate = dates[date];
  console.log(selectedDate);
  callback(currency, selectedDate.start, selectedDate.finish, "json");
};

const fetchDatas = async (currency, start, finish, type) => {
  const cur = currency.key;
  const data = await central.fetchData(currency.url, start, finish, type);
  let startDate = moment(start, "DD-MM-YYYY").format("YYYY_MM");
  let endDate = moment(finish, "DD-MM-YYYY").format("YYYY_MM");
  const dataSize = data.items.length;
  const newData = data.items.map((item, index) => {
    let itemDate = moment(item.Tarih, "DD-MM-YYYY");
    if (item[cur]) {
      return { date: itemDate, value: item[cur] };
    } else if ((dataSize - index > 3) & (index > 3)) {
      for (i = 1; i < 4; i++)
        try {
          if (data.items[index + i][cur]) {
            return {
              date: itemDate,
              value: data.items[index + i][cur],
            };
          } else {
            if (data.items[index - i][cur]) {
              return {
                date: itemDate,
                value: data.items[index - i][cur],
              };
            }
          }
        } catch (error) {
          console.log(error);
        }
      {
      }
    } else if (dataSize - index < 3) {
      for (i = 1; i < 4; i++)
        try {
          if (data.items[index - i][cur]) {
            return {
              date: itemDate,
              value: data.items[index - i][cur],
            };
          }
        } catch (error) {
          console.log(error);
        }
    } else if (index < 3) {
      for (i = 1; i < 4; i++)
        try {
          if (data.items[index + i][cur]) {
            return {
              date: itemDate,
              value: data.items[index + i][cur],
            };
          }
        } catch (error) {
          console.log(error);
        }
    }
  });
  fs.writeFile(
    `./${cur}-${startDate}-${endDate}.json`,
    JSON.stringify(newData),
    "utf-8",
    (err) => {
      console.log(`file has been written for ${cur}`);
    }
  );
};

//fetchDatas(USDtoTL, "21-12-1998", "31-12-1998", "json");
/*const name = prompt("What is your name?");
console.log(`Hey there ${name}`);*/

console.log("Starting to report");
console.log("__________________");

const readFile = (cur, start, finish) => {
  let status = [];
  let startDate = moment(start, "DD-MM-YYYY").format("YYYY_MM");
  let endDate = moment(finish, "DD-MM-YYYY").format("YYYY_MM");
  let newItem = startDate + "-" + endDate;
  let fileLink = `./${cur}-${startDate}-${endDate}.json`;

  if (!status.find((item) => item.date === newItem)) {
    newPose = { date: newItem, status: "undefined" };
    status.push(newPose);
  }
  try {
    const data = fs.readFileSync(fileLink, "utf-8");
    if (data) {
      status = status.map((item) => {
        if (item.date === newItem) {
          //console.log("here we are NO");
          return { date: newItem, status: "updated" };
        } else return item;
      });
    }
  } catch (error) {
    status = status.map((item) => {
      if (item.date === newItem) {
        //console.log("here we are NO");
        return { date: newItem, status: "not updated" };
      } else return item;
    });
  }
  return status[0];
};
createDates(createCurrencies);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://mullberry-af9a1-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.database();
