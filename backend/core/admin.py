from django.contrib import admin
from .models import (
    Vehicle, Driver, Fine, VehicleInspection, SystemUser, SystemConfig,
    Consumer, Supplier, Case, CaseMessage, Document,
    ProconInspection, Overindebtedness, Hearing
)

admin.site.register(Vehicle)
admin.site.register(Driver)
admin.site.register(Fine)
admin.site.register(VehicleInspection)
admin.site.register(SystemUser)
admin.site.register(SystemConfig)
admin.site.register(Consumer)
admin.site.register(Supplier)
admin.site.register(Case)
admin.site.register(CaseMessage)
admin.site.register(Document)
admin.site.register(ProconInspection)
admin.site.register(Overindebtedness)
admin.site.register(Hearing)

