var qualitySelection;
var returnedValue = [];
var returnStore = [];
var searchingBar;
var sendButton;

var currentItemName = '1st Place Statue - Season 10';
var currentItemID = 'UNIQUE_FURNITUREITEM_GVG_SEASON_10_1ST';

var sending = false;

const cities = ['Martlock', 'Bridgewatch', 'Lymhurst', 'Thetford', 'Fort Sterling', 'Caerleon', 'BlackMarket', 'ArthursRest']

document.addEventListener("DOMContentLoaded", () => 
{
    InitializeElements();
    FilterFunction();

    searchingBar.placeholder = currentItemName;
    searchingBar.value = '';
    LoadNewImage();
});

function InitializeElements()
{
    qualitySelection = document.getElementById('quality');
    searchingBar = document.getElementById('itemNameSearch');
    sendButton = document.getElementById('SendData');

    for(var i = 0; i < 8; i++)
    {
        returnedValue[i] = document.getElementById('returnedValue' + i); 
    }
}

function SendRequest(cityIndex)
{
    ChangeSendingState(true);

    var req = new XMLHttpRequest();
    SendData(req, cities[cityIndex]);
    ReciveData(req, cityIndex);
}

function ReciveData(req, cityIndex)
{
    req.onreadystatechange = event => {
        if(req.readyState === 4 && req.status === 200)
        {
            ReturningValue(req, cityIndex);

            if(cityIndex < cities.length - 1)
            {
                SendRequest(++cityIndex);
            }
            else
            {
                RecivingDone();
            }
        }
    }
}

function ReturningValue(req, cityIndex)
{
    var returnedText = req.responseText;
    var json = JSON.parse(returnedText);

    if(json.sell_price_min != 0)
        returnStore[cityIndex] = json.city + ': ' + json.sell_price_min + ' ===> ' + GetDateString(json.sell_price_min_date);
}

function GetDateString(date)
{
    var convertedDate = new Date(date);
    var now = Date.now();

    var milisecondsDiff = now - convertedDate;
    var secondsDiff = Math.floor(milisecondsDiff / 1000);

    var result = '';

    if(secondsDiff < 60)
        result += secondsDiff + ' seconds ago.'
    else if(secondsDiff < 3600)
        result += Math.floor(secondsDiff/60) + ' minutes ago.'
    else if(secondsDiff < 86400)
        result += Math.floor(secondsDiff/3600) + ' hours ago.'
    else
        result += Math.floor(secondsDiff/86400) + ' days ago.'

    return result;
}

function RecivingDone()
{
    ChangeSendingState(false);

    for(var i = 0; i < returnStore.length; i++)
    {
        returnedValue[i].textContent = returnStore[i]; 
    }
}

function SendData(req, location)
{
    var ID = currentItemID;
    var quality = qualitySelection.value;

    var arrayToSend = [ID, location, quality];
    Send(req, arrayToSend);
}

function Send(req, data)
{
    req.open('POST', '/price', true);
    req.send(data);
}

function ChangeSendingState(isSending)
{
    sending = isSending;
    sendButton.disabled = isSending;
}

function FilterFunction() 
{
    var filter = searchingBar.value.toUpperCase();
    var div = document.getElementById("itemNameContainer");
    var a = div.getElementsByTagName("a");

    var show = [];

    for (var i = 0; i < a.length; i++) 
    {
        txtValue = a[i].textContent || a[i].innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) 
        {
          show[show.length] = a[i];
        }
        else
        {
            a[i].style.display = "none";
        }    
    }

    if(show.length <= 50)
    {
        div.style.display = "block";
        for (var i = 0; i < show.length; i++) 
        {
            show[i].style.display = "";
        }
    }
    else
    {
        div.style.display = "none";
    }
}

function ChangeItem(itemName, itemID)
{
    ShowSearchingTab();
    currentItemName = itemName;
    currentItemID = itemID;
    searchingBar.placeholder = currentItemName;
    searchingBar.value = '';
    FilterFunction();
    LoadNewImage();
}

function LoadNewImage()
{
    var canvas = document.getElementById("itemCanvas");
    var context = canvas.getContext("2d");

    var img = new Image();
    img.onload = function() {
    context.drawImage(img, 0, 0);
    };
    img.src = 'https://render.albiononline.com/v1/item/' + currentItemID.toUpperCase() + '.png';
}

function ShowSearchingTab()
{
    var dir = document.getElementById("itemNameDropdown");

    if(dir.style.display === 'block')
        dir.style.display = 'none';
    else
        dir.style.display = 'block';
}