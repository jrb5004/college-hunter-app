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
        initMap(responseJson);
        displayResults(responseJson);
    })
    .catch(err => {
        $('.error-message').text(`Something went wrong: ${err.message}`);
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

        var latLng = new google.maps.LatLng(responseJson.results[i]['location.lat'],responseJson.results[i]['location.lon']);
        var marker = new google.maps.Marker({
          position: latLng,
          map: map
        });
        var contentString = `${responseJson.results[i]['school.name']}`;
        var infowindow = new google.maps.InfoWindow()

        google.maps.event.addListener(marker, 'click', ((marker, contentString, infowindow) => {
            return () => {
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
            };
        })(marker, contentString, infowindow));

        $('.results-table').append(
            `<tr>
                <th scope="row"><a href="http://${responseJson.results[i]['school.school_url']}" target="_blank">${responseJson.results[i]['school.name']}</a></th>
                <td>${responseJson.results[i]['school.city']}, ${responseJson.results[i]['school.state']}</td>
                <td>${convertToPercent(responseJson.results[i]['latest.admissions.admission_rate.overall'])}</td>
                <td>${responseJson.results[i]['latest.admissions.sat_scores.average.overall']}</td>
                <td>${responseJson.results[i]['latest.student.size']}</td>
                <td>$${responseJson.results[i]['latest.cost.tuition.in_state']}</td>
                <td>$${responseJson.results[i]['latest.cost.tuition.out_of_state']}</td>
                <td>${convertToPercent(responseJson.results[i]['latest.completion.rate_suppressed.four_year_100_pooled'])}</td>
                <td>$${responseJson.results[i]['latest.earnings.6_yrs_after_entry.working_not_enrolled.mean_earnings']}</td>
            </tr>`
        )};
    $('.results').removeClass('hidden');
}

function formatResultsPage() {
    $('.results-table').empty();
    $('.banner').remove();
    $('.user-inputs').remove();
    $('.error-message').remove();
    $('main').removeClass('home');
    $('main').addClass('paper');
}

function convertToPercent(numberToConvert) {
    if (!numberToConvert || typeof numberToConvert !== 'number') return 'NA'
    return `${(numberToConvert * 100).toFixed(0)}%`
 }

/*
function formatNumbers(numberToFormat) {
    let formattedNumber = numberToFormat.toLocaleString('en');
    return formattedNumber;
}
*/

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
    $('body').scrollTop( 0 );
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

function initiatePage() {
    watchInput();
    handleNewSearchButton();
}

$(initiatePage);