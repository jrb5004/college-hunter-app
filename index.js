'use strict';

const searchURL = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const scorecardApiKey = 'SzC7hjHyOhLpPQI5hy0Qfm6Ed5PLKtNWCsnfHeIY';

function getColleges(zip, radius) {
    const paramString = `api_key=${scorecardApiKey}&school.degrees_awarded.predominant=3&_zip=${zip}&_distance=${radius}mi&_fields=id,school.name,school.city,school.state,id,latest.student.size,school.school_url,latest.admissions.sat_scores.average.overall,latest.admissions.admission_rate.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.completion.rate_suppressed.four_year_100_pooled,latest.earnings.6_yrs_after_entry.working_not_enrolled.mean_earnings,location.lon,location.lat`;
    const url = searchURL + '?' + paramString;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        displayResults(responseJson);
    })
    .catch(err => {
        $('.error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayResults(responseJson) {
    $('.results').empty();
    console.log(responseJson);
    for (let i = 0; i < responseJson.results.length; i++) {
        $('.results-list').append(
            `<li>
            <p>Location: ${responseJson.results[i]['school.city']}, ${responseJson.results[i]['school.state']}</p>
            </li>`
        )};
    $('.results').removeClass('hidden');
}

function watchInput() {
    $('form').submit(event => {
        event.preventDefault();
        let zipCode = $('.city-zip').val();
        let radius = $('.miles-radius').val();
        getColleges(zipCode, radius);
    })
}

$(watchInput);