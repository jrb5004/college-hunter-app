'use strict';

const collegeSearchUrl = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const mapsSearchUrl = 'https://maps.googleapis.com/maps/api/staticmap';
const scorecardApiKey = 'SzC7hjHyOhLpPQI5hy0Qfm6Ed5PLKtNWCsnfHeIY';
const mapsApiKey = 'AIzaSyA_sY_dRcWOXDYugaPqd7QDTbXviHFnLVc';
let map;

function getColleges(zip, radius) {
    const paramString = `api_key=${scorecardApiKey}&school.degrees_awarded.predominant=3&_zip=${zip}&_distance=${radius}mi&latest.student.size__range=1500..&_per_page=100&_sort=latest.student.size:desc&_fields=id,school.name,school.city,school.state,id,latest.student.size,school.school_url,latest.admissions.sat_scores.average.overall,latest.admissions.admission_rate.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.completion.rate_suppressed.four_year_100_pooled,latest.earnings.6_yrs_after_entry.working_not_enrolled.mean_earnings,location.lon,location.lat`;
    const collegesUrl = collegeSearchUrl + '?' + paramString;

    fetch(collegesUrl)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if (!responseJson.results || responseJson.results.length <= 0) throw new Error('No results in this area.  Enter new zipcode or distance radius.');
        initMap(responseJson);
        displayResults(responseJson);
    })
    .catch(err => {
        switch(err.message) {
            case 'Failed to fetch':
                $('.error-message').text(`Could not fetch results.  Check internet connection and try again.`);
                break;
            case 'Bad Request':
                $('.error-message').text(`Invalid zip code or radius.  Please try again.`);
                break;
                default:
            $('.error-message').text(`Something went wrong: ${err.message}`);
                break;
        }
        $('.error-message').removeClass('hidden');
    });
}

function displayResults(responseJson) {
    formatResultsPage();
    console.log(responseJson);
    $('.results-table').append(
            `<tr>
                <td></td>
                <th scope="col">Location</th>
                <th scope="col">Acceptance Rate</th>
                <th scope="col">Average SAT Score</th>
                <th scope="col">Undgraduate Students</th>
                <th scope="col">Yearly Tuition (in-state)</th>
                <th scope="col">Yearly Tuition (out-of-state)</th>
                <th scope="col">4 Year Completion Rate</th>
                <th scope="col">Average Salary - Recent Grads</th>
            </tr>`)
    for (let i = 0; i < responseJson.results.length; i++) {

        createMarker(responseJson.results[i]['location.lat'], responseJson.results[i]['location.lon'], `${responseJson.results[i]['school.name']}`);

        $('.results-table').append(
            `<tr>
                <th scope="row"><a href="http://${responseJson.results[i]['school.school_url']}" target="_blank">${responseJson.results[i]['school.name']}</a></th>
                <td>${responseJson.results[i]['school.city']}, ${responseJson.results[i]['school.state']}</td>
                <td>${convertToPercent(responseJson.results[i]['latest.admissions.admission_rate.overall'])}</td>
                <td>${formatScores(responseJson.results[i]['latest.admissions.sat_scores.average.overall'])}</td>
                <td>${formatNumbers(responseJson.results[i]['latest.student.size'])}</td>
                <td>${formatDollars(responseJson.results[i]['latest.cost.tuition.in_state'])}</td>
                <td>${formatDollars(responseJson.results[i]['latest.cost.tuition.out_of_state'])}</td>
                <td>${convertToPercent(responseJson.results[i]['latest.completion.rate_suppressed.four_year_100_pooled'])}</td>
                <td>${formatDollars(responseJson.results[i]['latest.earnings.6_yrs_after_entry.working_not_enrolled.mean_earnings'])}</td>
            </tr>`
        )};
    $('.results').removeClass('hidden');
    $('html').scrollTop( 0 );
}

function formatResultsPage() {
    $('.results-table').empty();
    $('.banner').remove();
    $('.user-inputs').remove();
    $('.error-message').remove();
    $('main').removeClass('home');
    $('main').addClass('paper');
}

function createMarker(lat, lon, contentString) {
    var latLng = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
    var infowindow = new google.maps.InfoWindow()

    google.maps.event.addListener(marker, 'click', ((marker, contentString, infowindow) => {
        return () => {
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        };
    })(marker, contentString, infowindow));
}

function convertToPercent(numberToConvert) {
    if (!numberToConvert || typeof numberToConvert !== 'number') return 'NA';
    return `${(numberToConvert * 100).toFixed(0)}%`;
 }


function formatDollars(numberToFormat) {
    if (numberToFormat === null) return 'NA';
    else {
    let formattedNumber = numberToFormat.toLocaleString('en');
    return '$' + formattedNumber;
    }
}

function formatNumbers(numberToFormat) {
    if (numberToFormat === null) return 'NA';
    else {
    let formattedNumber = numberToFormat.toLocaleString('en');
    return  formattedNumber;
    }
}

function formatScores(scoreToFormat) {
    if (scoreToFormat === null) return 'NA';
    else {
    return  scoreToFormat;
    }
}

function initMap(responseJson) {
    if (!responseJson) return;
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 9,
      center: new google.maps.LatLng(responseJson.results[0]['location.lat'],responseJson.results[0]['location.lon']),
      mapTypeId: 'terrain'
    });
}

function handleNewSearchButton() {
    $('.results').on('click', '.new-search', event => {
        console.log('test');
        location.reload();
    $('html').scrollTop( 0 );
    });
}

function watchInput() {
    $('form').submit(event => {
        event.preventDefault();
        let zipCode = $('.city-zip').val();
        let radius = $('.miles-radius').val();
        getColleges(zipCode, radius);
    })
}

function watchTitleClick() {
    $('h1').on('click', event => {
        location.reload();
    $('html').scrollTop( 0 );
    });
}

function initiatePage() {
    watchInput();
    handleNewSearchButton();
    watchTitleClick();
}

$(initiatePage);