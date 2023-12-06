from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView

# Liste des vues
from .views.other_views import WebappHome, Dashboard
from .views.order_views import CreateOrder, EditOrder, DeleteOrder, SearchOrder
from .views.product_views import AddProductsToOrder, DeleteProduct, EditProduct, product_order_list
from .views.api_views import DeleteOrderAttachment, get_clients, \
    get_canvas, get_orders, save_attachment

app_name = 'webapp'

urlpatterns = [
    # Identification Routes
    path('login', LoginView.as_view(template_name='webapp/login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='webapp:login'), name='logout'),


    # Primary Routes
    path('', LoginView.as_view(template_name='webapp/login.html'), name='login'),
    path('home/', WebappHome.as_view(), name='home'),
    path('dashboard/', Dashboard.as_view(), name='dashboard'),

    # Order Routes
    path('orders/create/', CreateOrder.as_view(), name='order-create'),
    path('orders/<int:pk>/edit/', EditOrder.as_view(), name='order-edit'),
    path('orders/<int:pk>/delete/', DeleteOrder.as_view(), name='order-delete'),
    path('orders/<int:pk>/add-products/', AddProductsToOrder.as_view(), name='order-add-products'),
    path('orders/search', SearchOrder.as_view(), name='order-search'),

    # Products Routes
    path('products/<int:pk>/edit/', EditProduct.as_view(), name='product-edit'),
    path('products/<int:pk>/delete/', DeleteProduct.as_view(), name='product-delete'),  
    
    # Attachment Routes
    path('save_canvas/', save_attachment, name='save_canvas'),
    path('save_pictures/', save_attachment, name='save_pictures'),
    path('delete_canvas/<int:pk>', DeleteOrderAttachment.as_view(), name='delete_canvas'),
    path('delete_picture/<int:pk>', DeleteOrderAttachment.as_view(), name='delete_picture'),
    
    # API Routes
    path('get_clients/', get_clients, name='get_clients'),
    path('get_canvas/<int:pk>', get_canvas, name='get_canvas'),
    path('get_orders/', get_orders, name='get_orders'),
    path('product_order_list/<int:order_id>/', product_order_list, name='product_order_list'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
