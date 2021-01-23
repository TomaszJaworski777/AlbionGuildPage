module.exports = BuildURL;
var URL_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices/';

function BuildURL(itemID)
{
    var URL = URL_BASE + itemID + '.json';

    return URL;
}