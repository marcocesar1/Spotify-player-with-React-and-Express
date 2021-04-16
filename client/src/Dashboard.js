import { useState, useEffect } from 'react'
import useAuth from './useAuth';
import { Container, Form } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import TrackSearchResult from './TrackSearchResult';
import Player from './Player';
import axios from 'axios';

const spotifyApi = new SpotifyWebApi({
    clientId: '1ba4e7f62ef94f468c9b66136bce209e'
});

export default function Dashboard({ code }) {

    const accessToken = useAuth(code);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [playingTrack, setPlayingTrack] = useState();
    const [lyrics, setLyrics] = useState('');

    //console.log(searchResults)

    function chooseTrack(track){
        setPlayingTrack(track)
        setSearch("")
        setLyrics("")
    }

    useEffect(() => {
        if(!playingTrack) return

        axios.get('http://localhost:3001/lyrics',{
            params : {
                track: playingTrack.title,
                artist: playingTrack.artist
            }
        }).then(res => {
            setLyrics(res.data.lyrics)
        });

    }, [playingTrack])

    useEffect(() => {
        if(!accessToken) return
        spotifyApi.setAccessToken(accessToken);
    }, [accessToken]);

    useEffect(() => {
        if (!search) return setSearchResults([])
        if(!accessToken) return

        let cancel = false;
        if(cancel) return
        spotifyApi.searchTracks(search).then(res => {            
            const filterResults = res.body.tracks.items.map(track => {
                const smalllestAlbumImage = track.album.images.reduce((smallest, image) => {
                    if(image.height < smallest.height) return image
                    return smallest
                }, track.album.images[0]);
                
                return {
                    artist : track.artists[0].name,
                    title : track.name,
                    url: track.uri,
                    albumUrl: smalllestAlbumImage.url
                }
            });
            setSearchResults(filterResults);
        });

        return () => {
            console.log('clear!')
            cancel = true
        }
    }, [search, accessToken]);

    return (
        <Container className="d-flex flex-column py-2" style={{height: '100vh'}}>
            <Form.Control type="search" placeholder="Search Songs/Artist" value={search} onChange={e => setSearch(e.target.value)}/>
            <div className="flex-grow-1 my-2" style={{overflowY: 'auto'}}>
                {
                    searchResults.map(track => (
                        <TrackSearchResult 
                            track={track} 
                            key={track.url}
                            chooseTrack={chooseTrack}
                        />
                    ))
                }
                {
                searchResults.length === 0 && (
                    <div className="text-center" style={{ whiteSpace: "pre" }}>
                        {lyrics}
                    </div>
                    )
                }
            </div>
            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.url}/>
            </div>
        </Container>
    )
}
