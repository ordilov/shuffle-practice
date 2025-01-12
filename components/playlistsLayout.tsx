import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {createPlaylistApi, getPlayingApi, getPlaylistsApi} from "../api/server";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import Playlists from "./playlists";
import PlayBar from "./player/play-bar";
import YouTube, {Options} from "react-youtube";
import {YouTubePlayer} from "youtube-player/dist/types";
import {PlayingType, PlaylistItem, PlaylistType} from "../libs/types";
import {Mode} from "./player/player-mode";

function PlaylistsLayout() {
    const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
    const [editable, setEditable] = useState([] as boolean[]);
    const [target, setTarget] = useState<YouTubePlayer>();
    const [index, setIndex] = useState(0);
    const [state, setState] = useState(-1);
    const [mode, setMode] = useState(Mode.NORMAL);
    const [playlistTitle, setPlaylistTitle] = useState("");
    const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);

    useEffect(() => {
        getPlaylists();

        getPlayingApi().then((data: PlayingType) => {
            if (!data) return;
            setPlaylistItems(data.items);
            const index = data.items.findIndex(item => item.id === data.nowPlaying);
            console.log(data.items, data.nowPlaying)
            setIndex(index);
        });
    }, []);

    const getPlaylists = async () => {
        const playlists = await getPlaylistsApi();
        setEditable(playlists.map(() => false));
        setPlaylists(playlists);
        return playlists;
    };

    async function createPlaylist(title: string) {
        await createPlaylistApi(title);
        await getPlaylists();
        setPlaylistTitle("");
        editable.push(true);
        setEditable(editable);
    }

    if (!playlists) {
        return <a className="nav-link" href="#" onClick={() => createPlaylist(playlistTitle)}>
            <FontAwesomeIcon icon={faPlus as IconProp} size={"1x"}/> 플레이리스트 생성
        </a>
    }

    const opts: Options = {
        height: "300",
        width: "300",
        playerVars: {
            autoplay: 0,
        }
    };

    function onReady(event: { target: YouTubePlayer; data: number }) {
        setTarget(event.target);
        if (playlistItems == null) return;
        let videoId = playlistItems.map(item => item.resourceId);
        event.target.cuePlaylist(videoId);
    }

    function onStateChange(event: { target: YouTubePlayer; data: number }) {
        setState(event.data);
    }

    return <>
        <button type="button" data-bs-toggle="modal" data-bs-target="#playlist-title-modal">
            <FontAwesomeIcon icon={faPlus as IconProp} size={"1x"}/> 플레이리스트 생성
        </button>

        <div className="modal fade" id="playlist-title-modal" tabIndex={-1} aria-labelledby="ptm"
             aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="inputGroup-sizing-default">플레이리스트 제목</span>
                            <input type="text" className="form-control" aria-label="Sizing example input"
                                   aria-describedby="inputGroup-sizing-default" id={"playlist-title"}
                                   value={playlistTitle}
                                   onChange={(e) => setPlaylistTitle(e.target.value)}/>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={() => createPlaylist(playlistTitle)}>
                            만들기
                        </button>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        </div>

        <Playlists playlistDatas={playlists}/>

        <div className={"d-flex justify-content-center"}>
            <YouTube opts={opts} onReady={onReady} onStateChange={onStateChange}/>
        </div>

        {target && <PlayBar target={target}
                            readOnly={false}
                            modeState={[mode, setMode]}
                            indexState={[index, setIndex]}
                            playingState={[state, setState]}
                            playlistItemsState={[playlistItems, setPlaylistItems]}/>}
    </>
}


export default PlaylistsLayout;