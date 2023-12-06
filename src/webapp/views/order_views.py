from django.views.generic import (
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
)

from ..forms import NewOrderForm, NewCustomerForm
from ..models import Customer, Order, OrderHasProduct, OrderAttachment
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
import os.path
from django.conf import settings
from django.db.models import Q


class CreateOrder(CreateView):
    form_class = NewOrderForm
    template_name = "webapp/orders/order-create.html"
    success_url = "/dashboard"

    def get_context_data(self, **kwargs):
        context = {
            "order_form": NewOrderForm(),
            "customer_form": NewCustomerForm(),
        }

        return context

    def get_or_create_customer(self, customer_id, customer_form):
        is_existing_customer = False
        customer = None

        
        # On test l'id
        try:
            customer_id = int(customer_id)
        except ValueError:
            customer_id = None
        # Si on a un id valide
        if customer_id:
            try:
                # on essaye de le récupérer (s'il existe)
                customer = Customer.objects.get(id=customer_id)
                is_existing_customer = True
            except Customer.DoesNotExist:
                customer = None
        # Si on a pas d'id valide, on créer un nouveau client
        if not customer:
            customer = customer_form.save()
        return customer, is_existing_customer

    def post(self, request, *args, **kwargs):
        order_form = NewOrderForm(request.POST)
        customer_form = NewCustomerForm(request.POST)
       
        
        if order_form.is_valid() and customer_form.is_valid():
            # On récupère l'id du champ caché
            customer_id = request.POST.get("id", None)
            print(customer_id)
            # On récupère le client (existant ou nouveau)
            customer, is_existing_customer = self.get_or_create_customer(
                customer_id, customer_form
            )
            # Si c'est un nouveau client
            if is_existing_customer:
                # On boucle sur les données du formulaire pour mettre à jour l'existant
                for field, value in customer_form.cleaned_data.items():
                    setattr(customer, field, value)
                customer.save()

            # On rattache le client à l'order
            order = order_form.save(commit=False)
            order.customer = customer
            order.save()
            return redirect("/dashboard")
        else:
            # Si le formulaire n'est pas valide
            # On renvoi le context + l'id du client
            customer_id = request.POST.get("id", None)
            context = {
                "order_form": order_form,
                "customer_form": customer_form,
                "customer_id": customer_id,
            }
            return render(request, self.template_name, context)


class EditOrder(UpdateView):
    model = Order
    form_class = NewOrderForm
    template_name = "webapp/orders/order-edit.html"
    success_url = reverse_lazy("webapp:dashboard")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order = self.get_object()
        context["order_form"] = NewOrderForm(instance=order)
        customer_instance = order.customer
        context["customer_form"] = NewCustomerForm(instance=customer_instance)
        context["product_order"] = OrderHasProduct.objects.filter(order=order.id)
        context["attachments"] = OrderAttachment.objects.filter(
            order=order.id, type="canvas"
        )[:50]
        context["attachments_pictures"] = [
            {
                "filename": os.path.basename(attachment.file.name),
                "url": attachment.file.url,
                "pk": attachment.pk,
            }
            for attachment in OrderAttachment.objects.filter(
                order=order.id, type="picture"
            ).order_by("pk")[:50]
        ]
        return context

    # Check la validité de form (order)
    def form_valid(self, form):
        # Check la validité de customer
        customer_form = NewCustomerForm(
            self.request.POST, instance=self.object.customer
        )
        if customer_form.is_valid():
            form.save()
            customer_form.save()
            return super().form_valid(form)
        else:
            return self.form_invalid(form)

    def form_invalid(self, form):
        customer_form = NewCustomerForm(
            self.request.POST, instance=self.object.customer
        )
        context = self.get_context_data()
        context["customer_form"] = customer_form
        return self.render_to_response(context)


class DeleteOrder(DeleteView):
    model = Order
    context_object_name = "commandes"
    template_name = "webapp/orders/order-delete.html"
    success_url = reverse_lazy("webapp:dashboard")

    # Surcharge de la méthode afin de supprimer les medias(canvas+photos)
    def form_valid(self, form):
        order_id = self.object.id
        order_attachments = OrderAttachment.objects.filter(order=order_id)

        if order_attachments:
            for attachment in order_attachments:
                if attachment.file:
                    file_path = os.path.join(settings.MEDIA_ROOT, attachment.file.path)
                    if os.path.exists(file_path):
                        os.remove(file_path)

        response = super().form_valid(form)
        return response


class SearchOrder(ListView):
    model = Order
    template_name = "webapp/orders/order-search.html"

    def get_queryset(self):
        query = self.request.GET.get("q")
        order_list = Order.objects.filter(
            Q(label__icontains=query)  # libellé
            | Q(status__label__icontains=query)  # status
            | Q(pk__icontains=query)  # id
            | Q(customer__first_name__icontains=query)
            | Q(customer__last_name__icontains=query)
            | Q(customer__mail__icontains=query)
            | Q(customer__address__icontains=query)
            | Q(customer__phone_number__icontains=query)
        )[:50]
        return order_list
