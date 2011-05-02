
function catCallback(data) {
    var html = '';
    cityHeight = findMax(data.totals);
    sorted = sortedCities(data.totals);
    $.each(sorted, function () {
        city = this[0];
        total = this[1];
        html += "<span class='entry'><span class='city'>" + city + "</span><span class='total'>" + total + "</span></span>";
    });
//    html += "<h2>Max was " + max[0] + " in " + max[1] + "</h2>";
    html += "<span class='entry' id='hist'><b>Historic Data</b></span>";
    $('#result').html(html);
    $('#hist').click(showHistory);
    $(document.body).focus();
    return;
}
var hold
function showHistory() {
    hold = cityHeight;
    c = cathistory.length - 1;
    changeHistory(c, hold);
}

function changeHistory(c) {
    day = cathistory[c][0];
    cityHeight = cathistory[c][1];
    $('#hist').html(day);
    $(document.body).focus();
    if(c > 0) {
        window.setTimeout("changeHistory(--c)", 2000);
    } else { finishHistory(); };
    return;
}

function finishHistory() {
    $('#hist').html('Today');
    cityHeight = hold;
    $(document.body).focus();
    window.setTimeout("normalize()",2000);
}

function normalize() {
    $('#hist').html('Historic Data');
}

jQuery(document).ready(function($) {
    var search = new window.threeTapsSearchClient;
    var params = {
        'category': 'SAPP', 
        'dimension': 'location'
    };
    //alert(search)
    var blank = "screwit";
    search.summary(params, catCallback);
    
    $('select#category').change(function(){
        var cat = $(this).val();
        var url = 'http://3taps.net/search/summary';
        var vars = 'dimension=location&category='+cat;
        var search = new window.threeTapsSearchClient;
        /*alert(vars)
        $.ajax({
           type: "GET",
           url: url,
           data: vars,
           datatype: 'text',
           islocal: 'false',
           complete: catCallback,
        });
        return;*/
        var params = {
            'category': cat, 
            'dimension': 'location'
        };
        //alert(search)
        var blank = "screwit";
        search.summary(params, catCallback);
    });
});

function findMax(totals) {
    var max = 0;
    var cmax = '';
    $.each(totals, function (city, total) {
        if (total > max) {
            max = total;
        };
    });
    var normalized = {};
    $.each(totals, function (city, total) {
        if (max != 0 && total != 0) {
            normalized[city] = total/(max);
        } else {
            normalized[city] = 0;
        }
    });
    
    return normalized;
}

cityMap = {
    "LAX":"Los Angeles",
    "SFO":"San Francisco",
    "PHX":"Phoenix",
    "DFW":"Dallas-Fort Worth",
    "SAN":"San Diego",
    "SEA":"Seattle",
    "NYC":"New York City",
    "ATL":"Atlanta",
    "CHI":"Chicago",
    "PDX":"Portland"
};

function sortedCities(totals) {
    var cities = new Array();
    $.each(totals, function (city, total) {
        cities.push([cityMap[city],total]);
    });
    cities.sort(function(a,b){return b[1] - a[1];});
    return cities;
}

