import React, {useState} from "react";
import axios from "axios";
import "../styles/Home.css";


const Home = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoInfo, setVideoInfo] = useState(null);
    const [format, setFormat] = useState('mp4');
    const [quality, setQuality] = useState('1080p');
    const [convertedFileUrl, setConvertedFileUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchVideoInfo = async (url) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/get-video-info/', {url});
            setVideoInfo(response.data);
            setError('')
        } catch (error) {
            console.error('Error getting video info', error);
            setError('Error fetching video info, please try again')
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('url', videoUrl);
        formData.append('format', format);
        formData.append('quality', quality);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/convert/', formData, {
                headers: {
                    'Content-Type':'multipart/form-data'
                }
            });
            setConvertedFileUrl(response.data.converted_file_url);
            setError('');
        } catch (error) {
            console.error('Error converting video', error);
            setError('Error converting video, please try again')
        } finally {
            setLoading(false);
        }
    };

    const handleFetchInfo = (e) => {
        e.preventDefault();
        fetchVideoInfo(videoUrl);
    }

    const handleConvertAnother = () => {
        setVideoUrl('');
        setVideoInfo(null);
        setFormat('mp4');
        setQuality('1080p');
        setConvertedFileUrl(null);
        setError('');
    }

    return (
        <div className="home">
            <header>
                <h1>Online Media Converter</h1>
            </header>
            <main>
                <section className="converter-form">
                    {error && <div className="error-message">{error}</div>}
                    {!convertedFileUrl && !videoInfo ? (
                        <form onSubmit={handleFetchInfo}>
                            <input 
                                type="text" 
                                id="video-url" 
                                name="video-url" 
                                value={videoUrl} 
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Paste video URL here... https://www.youtube.com/watch?v=e-REWRFRQ" 
                                required />
                            <button type="submit">Fetch Video Info</button>
                        </form>
                    ) : !convertedFileUrl && videoInfo ? (
                        <form onSubmit={handleSubmit}>
                            <h3>Video Information</h3>
                            <p><strong>Title:</strong> {videoInfo.title}</p>
                            <p><strong>Duration:</strong> {videoInfo.duration} seconds</p>
                            {videoInfo.thumbnail && <img src={videoInfo.thumbnail} alt='video thumbnail' className="video-thumbnail"/>}
                            <label htmlFor="format">Choose Format</label>
                            <select 
                                name="format" 
                                id="format"
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                required
                            >
                                <option value="mp4">MP4</option>
                                <option value="avi">AVI</option>
                                <option value="mov">MOV</option>
                                <option value="mp3">MP3</option>
                            </select>
                            {format !== 'mp3' && (
                                <>
                                    <label htmlFor="quality">Choose Quality</label>
                                    <select 
                                        name="quality" 
                                        id="quality"
                                        value={quality}
                                        onChange={(e) => setQuality(e.target.value)}
                                        required
                                    >
                                        <option value="1080p">1080p</option>
                                        <option value="720p">720p</option>
                                        <option value="480p">480p</option>
                                        <option value="360p">360p</option>
                                    </select>
                                </>
                            )}
                            <button type="submit">Convert Video</button>
                        </form>
                    ) : convertedFileUrl && (
                        <div className="download-link">
                            <a href={convertedFileUrl} download="converted-file">
                                <button className="download-button">Download Converted file</button>
                            </a>
                            <br /><br />
                            <button className="convert-another-button" onClick={handleConvertAnother}>
                                Convert Another Video
                            </button>
                        </div>
                    )}
                    {loading && (
                        <div className="modal">
                            <div className="modal-content">
                                <p>Please wait .....</p>
                                <div className="loading-spinner"></div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <footer>
                <p>&copy; 2024 Online Media Converter. All rights reserved.</p>
            </footer>

        </div>
    )
}

export default Home;