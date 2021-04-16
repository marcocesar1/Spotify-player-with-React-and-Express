
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const lyricsFinder = require('lyrics-finder');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

app.post('/refresh', (req, res) => {

    console.log('refesh')

    const refreshToken = req.body.refreshToken;
    const credentials = {
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    };
    const spotifyApi = new SpotifyWebApi(credentials);

    spotifyApi.refreshAccessToken().then(data => {
        console.log(data.body)
        res.json({
            accessToken : data.body.access_token,
            expriresIn : data.body.expires_in
        });
    }).catch(err => {
        console.log(err)
        res.sendStatus(400);
    });
});

app.post('/login', (req, res) => {
    const credentials = {
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    };
    const code = req.body.code;
    const spotifyApi = new SpotifyWebApi(credentials);

    spotifyApi.authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken : data.body.access_token,
            expriresIn : data.body.expires_in,
            refreshToken : data.body.refresh_token
        });
    }).catch(err => {
        console.log(err)
        res.sendStatus(400);
    });
});

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || 'No Lyrics Found'
    res.json( { lyrics } )
})

app.listen(3001);