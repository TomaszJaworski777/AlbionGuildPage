module.exports = BuildURL;
var URL_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices/';

function BuildURL(itemID, location, quality)
{
    var URL = URL_BASE + itemID + '.json?locations=' + location + '&qualities=' + quality;

    return URL;
}