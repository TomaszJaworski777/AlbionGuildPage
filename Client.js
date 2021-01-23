var qualitySelection;
var returnedValue = [];
var returnStore = [];
var searchingBar;
var sendButton;
var itemImage;

var currentItemName = '1st Place Statue - Season 10';
var currentItemID = 'UNIQUE_FURNITUREITEM_GVG_SEASON_10_1ST';

var sending = false;
var recivingIndex = 0;

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
    itemImage = document.getElementById('itemImage');

    for(var i = 0; i < 8; i++)
    {
        returnedValue[i] = document.getElementById('returnedValue' + i); 
    }
}

function SendRequest()
{
    ChangeSendingState(true);

    var req = new XMLHttpRequest();
    Send(req, currentItemID);
    ReciveData(req);
}

function ReciveData(req)
{
    req.onreadystatechange = event => {
        if(req.readyState === 4 && req.status === 200)
        {
            const returnedText = req.responseText;
            const json = JSON.parse(returnedText);

            ResetStoreDataArray();
            recivingIndex=0;

            for(var i = 0; i < json.length; i++)
            {
                const data = json[i];
                if(data.quality == qualitySelection.value && data.sell_price_min > 0)
                {
                    returnStore[recivingIndex] = data.city + ': ' + data.sell_price_min + ' ===> ' + GetDateString(data.sell_price_min_date);
                    recivingIndex++;
                }
            }

            PrintResults();
        }
    }
}

function ResetStoreDataArray()
{
    for(var i = 0; i < returnStore.length; i++)
    {
        returnStore[i] = '';
    }
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

function PrintResults()
{
    ChangeSendingState(false);

    for(var i = 0; i < returnStore.length; i++)
    {
        returnedValue[i].textContent = returnStore[i]; 
    }
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
    qualitySelection.disabled = isSending;
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
    itemImage.src = 'https://render.albiononline.com/v1/item/' + currentItemID.toUpperCase() + '.png?quality=' + qualitySelection.value;
}

function ShowSearchingTab()
{
    var dir = document.getElementById("itemNameDropdown");

    if(dir.style.display === 'block')
        dir.style.display = 'none';
    else
        dir.style.display = 'block';
}

function QualityChanged()
{
    LoadNewImage();
}