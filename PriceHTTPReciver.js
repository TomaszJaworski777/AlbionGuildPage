const buildURL = require('./UrlBuilder');
const got = require('got');
module.exports.getPrice = getPrice;
module.exports.getPriceList = getPriceList;
module.exports.clear = clearPriceList;

var priceList = [];

function clearPriceList()
{   
    priceList = [];
}

function getPriceList()
{
    return priceList;
}

function getPrice(itemId, location, quality)
{
    var URL = buildURL(itemId, location, quality);
    console.log(URL);
    getResponse(URL);
}

function getResponse(URL)
{
    (async () => 
    {
        try {
          const response = await got(URL, { json: true });
          var json = response.body[0];
          var currentDate = new Date(Date.now());
          json.refreshDate = currentDate;
          addToPriceList(json);
          console.log(json);
        } catch (error) {
          console.log(error.response.body);
        }
    })();
}

function addToPriceList(json)
{
    priceList[priceList.length] = json;
}