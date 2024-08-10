import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'
import pauseIcon from './assets/pause.svg'
import playIcon from './assets/play.svg' 

const App = () => {
  const [songs, setSongs] = useState([])
  const [topSongs, setTopSongs] = useState([])

  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const audioRef = useRef(null)

  const [selectedCategory, setSelectedCategory] = useState('For You')


  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }
  
  useEffect(() => {
    if (audioRef.current) {
      const updateProgress = () => {
        setCurrentTime(audioRef.current.currentTime)
        setDuration(audioRef.current.duration)
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
      }
  
      audioRef.current.addEventListener('timeupdate', updateProgress)
      audioRef.current.addEventListener('loadedmetadata', () => setDuration(audioRef.current.duration))
      return () => {
        audioRef.current.removeEventListener('timeupdate', updateProgress)
      }
    }
  }, [currentSongIndex, isPlaying])
  

 
  const handleProgressChange = (event) => {
    const newValue = event.target.value
    setProgress(newValue)
    if (audioRef.current) {
      audioRef.current.currentTime = (newValue / 100) * audioRef.current.duration
    }
  }
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  useEffect(() => {
    axios.get('https://cms.samespace.com/items/songs')
    .then(response => {
      const data = response?.data?.data || []
      setSongs(data)
      setTopSongs(data)
    })
      .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    handleSearch()
  }, [searchQuery])


  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.error("Error playing audio:", error))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSongIndex])

  const handleSongSelect = (index) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
    updateBackgroundColor(songs[index])
    console.log()
  }

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
  
    const filteredSongs = songs.filter(song =>
      song.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSearchResults(filteredSongs)
  }

  useEffect(() => {
    updateBackgroundColor(songs[currentSongIndex])
  }, [currentSongIndex, songs])

  const playPause = () => {
    setIsPlaying(!isPlaying)
    updateBackgroundColor(songs[currentSongIndex])

  }

  const nextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length)
    setIsPlaying(true)
  }

  const prevSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length)
    setIsPlaying(true)
  }


  const updateBackgroundColor = (song) => {
    if (song?.accent) {
      let accentColor = song.accent.startsWith('#') ? song.accent : `#${song.accent}`
      document.body.style.background = `linear-gradient(to right, ${accentColor}, #000000)`
      console.log(accentColor)
    }
  }
  
  const displayedSongs = selectedCategory === 'For You' ? songs : topSongs

  useEffect(()=>
    {
      console.log("displayed", topSongs)
    },[displayedSongs])

  return (
    <div className="app">
      <img src="/Spotify-Black-and-White-Logo.png" alt="Spotify Logo" className="logo" />
      <div className='left'>
      <div style={{ display: "flex", justifyContent: "space-between", width: "250px", justifySelf: "start" }}>
  <h3
    className={selectedCategory === 'For You' ? 'selected-category' : 'unselected-category'}
    onClick={() => handleCategoryChange('For You')}
  >
    For You
  </h3>
  <h3
    className={selectedCategory === 'Top Songs' ? 'selected-category' : 'unselected-category'}
    onClick={() => handleCategoryChange('Top Songs')}
  >
    Top Songs
  </h3>
</div>
        <div className="search-bar" style={{width:"280px"}}>
          <input
            type="text"
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={`song-list ${selectedCategory === 'For You' || selectedCategory === 'Top Songs' ? 'fade-in' : ''}`} style={{ width: "280px" }}>
  {searchQuery ? (
    <div className="results">
      {searchResults?.map((song, index) => (
        <div
          key={song.id}
          className={`song-item ${index === currentSongIndex ? 'playing' : ''}`}
          onClick={() => handleSongSelect(index)}
        >
          <img
            src={`https://cms.samespace.com/assets/${song.cover}`}
            alt={song.name}
            style={{ height: "50px", width: "50px", borderRadius: "25px" }}
          />
          <div className="song-info">
            <p>{song.name}</p>
            <p className='artist-name'>{song.artist}</p>
          </div>
          <p className="timestamp">0:00</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="results">
      {displayedSongs?.map((song, index) => (
        <div
          key={song.id}
          className={`song-item ${index === currentSongIndex ? 'playing' : ''}`}
          onClick={() => handleSongSelect(index)}
        >
          <img
            src={`https://cms.samespace.com/assets/${song.cover}`}
            alt={song.title}
            style={{ height: "50px", width: "50px", borderRadius: "25px" }}
          />
          <div className="song-info">
            <p>{song.name}</p>
            <p className='artist-name'>{song.artist}</p>
          </div>
          <p className="timestamp">0:00</p>
        </div>
      ))}
    </div>
  )}
</div>
      </div>

      <div className='right' style={{width:"40%", display:"flex", padding:"0px 100px"}}>
      <div className="player" style={{height:"100%", width:"100%"}}>
  {songs.length > 0 ? (
    <>
      <div className="song-info">
        <h3>{songs[currentSongIndex].name}</h3>
        <p>{songs[currentSongIndex].artist}</p>
      </div>
      <div className="cover" style={{height:"50%", width:"100%", display:"flex", justifyContent:"center" }}>
        <img className='cover-img' style={{height:"400px", width:"100%"}} src={`https://cms.samespace.com/assets/${songs[currentSongIndex].cover}`} alt="cover" />
      </div>
      <div className="progress-container">
        <input
        style={{width:"100%"}}
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="progress-bar"
        />
        <div className="progress-time">
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="controls">
        <button className='playback-button' onClick={prevSong}>Previous</button>
        <button className='playback-button' onClick={playPause}>
          <img src={isPlaying ? pauseIcon : playIcon} alt={isPlaying ? 'Pause' : 'Play'} style={{height:"50px", width:"30px"}} className='playback-icon' />
        </button>
        <button className='playback-button' onClick={nextSong}>Next</button>
      </div>

     

      <audio
        ref={audioRef}
        src={`${songs[currentSongIndex]?.url}`}
        onEnded={nextSong}
      ></audio>
    </>
  ) : (
    <p>Select a song to play</p>
  )}
</div>



      </div>
      <div className="profile-container">
  <img src="https://i.pinimg.com/originals/91/2c/e1/912ce19bfeadb1e9e2b7cee8f0a4f1bc.jpg" alt="Profile Picture" className="profile-pic" />
</div>
    </div>
  )
}

export default App
