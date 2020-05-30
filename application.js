var screenshotmachine = require('screenshotmachine');
var fs = require('fs');
var customerKey = '1f6873';
var secretPhrase = 'testphrase';
var options = {
    //mandatory parameter
    url: '',
    dimension: '1920x1080',
    device: 'desktop',
    format: 'jpg',
    cacheLimit: '0',
    delay: '500',
    zoom: '100'
}

var companies = {
    'iFunded': {
        id: '1',
        website: 'https://ifunded.de/en/'
    },
    'Property Partner': {
        id: '2',
        website: 'https://www.propertypartner.co'
    },
    'Property Moose': {
        id: '3',
        website: 'https://propertymoose.co.uk'
    },
    'Home Grown': {
        id: '4',
        website: 'https://www.homegrown.co.uk'
    },
    'Reality Mogul': {
        id: '5',
        website: 'https://www.realtymogul.com'
    }
}
for (var c in companies) {
    options['url'] = companies[c]['website'];
    companies[c]['apiURL'] = (screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options));
    var output = companies[c]['id'] + '_' + c + '.jpg';
    screenshotmachine.readScreenshot(companies[c]['apiURL']).pipe(fs.createWriteStream(output).on('close', function() {
        console.log('Screenshot saved as ' + output);
    }));
}