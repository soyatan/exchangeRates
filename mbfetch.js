const axios = require("axios");
const apiKey = require("./apiKey.js");

const baseURL = "https://evds2.tcmb.gov.tr/service/evds/";

const getInfo = (currency, startDate, endDate, type, apiKey) => {
  return `${baseURL}series=${currency}&startDate=${startDate}&endDate=${endDate}&type=${type}&key=${apiKey}&aggregationTypes=avg&formulas=0&frequency=1`;
};

const fetchData = async (currency, start, finish, type) => {
  try {
    const combinedURL = getInfo(currency, start, finish, type, apiKey);
    console.log(combinedURL);
    const response = await axios.get(combinedURL);
    let datam = await response.data;

    return datam;
  } catch (error) {
    console.log(error.response.body);
  }
};

module.exports = {
  fetchData,
};
