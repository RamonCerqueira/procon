from django.urls import path
from . import views

urlpatterns = [
    # Autenticação (MVC: View -> AuthController -> SystemUser Model)
    path('auth/login', views.auth_login, name='auth_login'),
    path('auth/login/', views.auth_login),
    path('auth/register', views.auth_register, name='auth_register'),
    path('auth/register/', views.auth_register),
    path('auth/me', views.auth_me, name='auth_me'),
    path('auth/me/', views.auth_me),

    # Sincronização de Estado SIGETRAN (TransportPortal)
    path('state/<str:key>', views.sigetran_state, name='sigetran_state'),
    path('state/<str:key>/', views.sigetran_state),

    # Endpoints REST SIGETRAN
    path('vehicles', views.vehicles_list, name='vehicles_list'),
    path('vehicles/', views.vehicles_list),
    path('vehicles/<str:plate>', views.vehicle_detail, name='vehicle_detail'),
    path('vehicles/<str:plate>/', views.vehicle_detail),
    path('drivers', views.drivers_list, name='drivers_list'),
    path('drivers/', views.drivers_list),
    path('drivers/<str:code>', views.driver_detail, name='driver_detail'),
    path('drivers/<str:code>/', views.driver_detail),
    path('fines', views.fines_list, name='fines_list'),
    path('fines/', views.fines_list),
    path('fines/<str:code>', views.fine_detail, name='fine_detail'),
    path('fines/<str:code>/', views.fine_detail),
    path('infraction-types', views.infraction_types_list, name='infraction_types_list'),
    path('infraction-types/', views.infraction_types_list),
    path('infraction-types/<str:code>', views.infraction_type_detail, name='infraction_type_detail'),
    path('infraction-types/<str:code>/', views.infraction_type_detail),
    path('ownership-transfers', views.ownership_transfers_list, name='ownership_transfers_list'),
    path('ownership-transfers/', views.ownership_transfers_list),
    path('vehicle-occurrences', views.vehicle_occurrences_list, name='vehicle_occurrences_list'),
    path('vehicle-occurrences/', views.vehicle_occurrences_list),
    path('vehicle-occurrences/<str:code>', views.vehicle_occurrence_detail, name='vehicle_occurrence_detail'),
    path('vehicle-occurrences/<str:code>/', views.vehicle_occurrence_detail),

    # Endpoints REST PROCON
    path('dashboard/stats', views.dashboard_stats, name='dashboard_stats'),
    path('dashboard/stats/', views.dashboard_stats),
    path('consumers', views.consumers_list, name='consumers_list'),
    path('consumers/', views.consumers_list),
    path('consumers/<int:pk>', views.consumer_detail, name='consumer_detail'),
    path('consumers/<int:pk>/', views.consumer_detail),
    path('suppliers', views.suppliers_list, name='suppliers_list'),
    path('suppliers/', views.suppliers_list),
    path('suppliers/<int:pk>', views.supplier_detail, name='supplier_detail'),
    path('suppliers/<int:pk>/', views.supplier_detail),
    path('cases', views.cases_list, name='cases_list'),
    path('cases/', views.cases_list),
    path('cases/<int:pk>', views.case_detail, name='case_detail'),
    path('cases/<int:pk>/', views.case_detail),
    path('cases/<int:pk>/messages', views.case_messages, name='case_messages'),
    path('cases/<int:pk>/messages/', views.case_messages),
    path('documents', views.documents_list, name='documents_list'),
    path('documents/', views.documents_list),
    path('documents/<int:pk>', views.document_detail, name='document_detail'),
    path('documents/<int:pk>/', views.document_detail),
    path('inspections', views.procon_inspections_list, name='procon_inspections_list'),
    path('inspections/', views.procon_inspections_list),
    path('overindebtedness', views.overindebtedness_list, name='overindebtedness_list'),
    path('overindebtedness/', views.overindebtedness_list),
    path('hearings', views.hearings_list, name='hearings_list'),
    path('hearings/', views.hearings_list),
]

