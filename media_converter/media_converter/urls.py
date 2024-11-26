from django.contrib import admin
from django.urls import path
from converter.views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('convert/', ConvertVideo.as_view(), name='convert-video'),
    path('get-video-info/', VideoInfo.as_view(), name='get-video-info'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
