from ..models import Order, OrderHasProduct, Product
from django.shortcuts import render
from django.views.generic import (
    CreateView,
    UpdateView,
    DeleteView,
)
from ..forms import AddProductForm, AddProductsToOrder
from django.http import  HttpResponse


def product_order_list(request, order_id):
    product_order = OrderHasProduct.objects.filter(order=order_id)

    # Calculer le total pour chaque produit
    for product in product_order:
        product.total = product.product.selling_price_unit * product.product.quantity
    total_order = sum(product.total for product in product_order)

    context = {
        "product_order": product_order,
        "order_id": order_id,
        "total_order": total_order,
    }
    return render(request, "webapp/products/product_order_list.html", context)

class DeleteProduct(DeleteView):
    model = Product
    context_object_name = "product"
    template_name = "webapp/products/product-delete.html"

    def get_success_url(self):
        return ""

    def form_valid(self, form):
        response = super().form_valid(form)
        return HttpResponse(status=204, headers={"HX-Trigger": "ProductsListChanged"})


class EditProduct(UpdateView):
    model = Product
    form_class = AddProductsToOrder
    template_name = "webapp/products/product-edit.html"
    context_object_name = "product"

    def get(self, request, *args, **kwargs):
        request.session["previous_url"] = request.META.get("HTTP_REFERER", "/")
        return super().get(request, *args, **kwargs)

    def get_success_url(self):
        return self.request.session.get("previous_url", "/")

    def form_valid(self, form):
        form.save()
        return HttpResponse(status=204, headers={"HX-Trigger": "ProductsListChanged"})

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))


class AddProductsToOrder(CreateView):
    form_class = AddProductForm

    template_name = "webapp/orders/order-product.html"

    def get(self, request, *args, **kwargs):
        request.session["previous_url"] = request.META.get("HTTP_REFERER", "/")
        return super().get(request, *args, **kwargs)

    def get_success_url(self):
        return self.request.session.get("previous_url", "/")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order_id = self.kwargs["pk"]
        all_product_filtered = OrderHasProduct.objects.all().filter(order_id=order_id)
        order_infos = Order.objects.get(pk=order_id)
        context["product_list"] = all_product_filtered
        context["order_id"] = order_id
        context["order_infos"] = order_infos
        return context

    def form_valid(self, form):
        response = super().form_valid(form)

        order_id = self.kwargs["pk"]
        order_object = Order.objects.get(pk=order_id)
        order_product = form.save(commit=False)
        order_product = form.save()
        OrderHasProduct.objects.create(order=order_object, product=order_product)
        return HttpResponse(status=204, headers={"HX-Trigger": "ProductsListChanged"})

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))
