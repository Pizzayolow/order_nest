from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from whitenoise import WhiteNoise

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('webapp.urls')),
    path("__reload__/", include("django_browser_reload.urls")),



]
#
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# else:
#     # Servir les fichiers médias en production avec Whitenoise

# urlpatterns += [re_path(r'^media/(?P<path>.*)$', WhiteNoise.serve, {'document_root': settings.MEDIA_ROOT})]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
