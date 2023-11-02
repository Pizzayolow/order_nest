# Generated by Django 4.2.6 on 2023-10-31 14:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webapp', '0011_alter_order_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('En attente', 'En attente'), ('en cours', 'En cours'), ('Terminée', 'Terminée'), ('Facturée', 'Facturée'), ('Annulée', 'Annulée')], default='En attente', max_length=32),
        ),
    ]