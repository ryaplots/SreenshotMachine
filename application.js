var screenshotmachine = require('screenshotmachine');
var fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// Google Autentication
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function uploadFile(auth, filePath) {
    const drive = google.drive('v3');
    const filesMetadata = {
        'name': filePath
    }
    const media = {
        mimeType: 'image/jpg',
        body: fs.createReadStream(filePath)
    }
    drive.files.create({
        auth: auth,
        resource: filesMetadata,
        media: media
    }, err => {
        if (err) console.log(err);
        else console.log('Uploaded!!');
    })
}


fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), function(auth) {


        //
        //Screenshot and upload
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
        for (let c in companies) {
            options['url'] = companies[c]['website'];
            companies[c]['apiURL'] = (screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options));
            companies[c]['fileName'] = companies[c]['id'] + '_' + c + '.jpg';
            screenshotmachine.readScreenshot(companies[c]['apiURL']).pipe(fs.createWriteStream(companies[c]['fileName']).on('close', function() {
                console.log('Screenshot saved as ' + companies[c]['fileName']);
                uploadFile(auth, companies[c]['fileName']);
            }));
        }
    });
});