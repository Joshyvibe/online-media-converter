import os
import ffmpeg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import yt_dlp
from django.utils.text import slugify




class VideoInfo(APIView):
    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'Video URL is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with yt_dlp.YoutubeDL() as ydl:
                info = ydl.extract_info(url, download=False)
                video_info = {
                    'title': info.get('title', 'Unknown Title'),
                    'duration': info.get('duration', 'Unknown Duration'),
                    'thumbnail': info.get('thumbnail', '')
                }
            return Response(video_info, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConvertVideo(APIView):
    def post(self, request):
        url = request.data.get('url')
        format = request.data.get('format')
        quality = request.data.get('quality')

        if not url or not format:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # extract the video from Youtube
            with yt_dlp.YoutubeDL() as ydl:
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown Title')
        except Exception as e:
            return Response({'error': 'Failed to extract video: {}'.format(str(e))}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        sanitized_title = slugify(title)
        input_path = os.path.join('media', 'downloads', f'{sanitized_title}.{format}')
        output_path = os.path.join('media', 'converted', f'{sanitized_title}.{format}')

        os.makedirs(os.path.dirname(input_path), exist_ok=True)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # download video or audio files
        try:
            download_video(url, input_path, format)
        except Exception as e:
            return Response({'error': 'Failed to download video: {}'.format(str(e))}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # statement to ensure file exists before conversion
        if not os.path.exists(input_path):
            return Response({'error': 'Download file does not exist'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # convert file
        try:
            if format in ['mp4', 'avi', 'mov']:
                ffmpeg.input(input_path).output(output_path, video_bitrate='1500k').run()
            elif format == 'mp3':
                ffmpeg.input(input_path).output(output_path, audio_bitrate='192k').run()
        except ffmpeg.Error as e:
            error_message = e.stderr.decode() if e.stderr else "Error decoding"
            return Response({'error': 'Failed to convert video: {}'.format(error_message)}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if os.path.exists(input_path):
                os.remove(input_path)

        converted_file_url = f'{request.build_absolute_uri("/media/converted/" + sanitized_title + "." + format)}'
        return Response({'converted_file_url': converted_file_url}, status=status.HTTP_200_OK)
    

def download_video(url, output_path, format):
    ydl_opts = {
        'format': "best" if format in ['mp4', 'avi', 'mov'] else 'bestaudio/best',
        'outtmpl': output_path,
        'noplaylist': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])