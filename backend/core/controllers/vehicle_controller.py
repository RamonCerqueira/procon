from django.db.models import Q
from rest_framework import status

from ..models import Vehicle
from ..serializers import VehicleSerializer
from ..seed import ensure_seed_data


class VehicleController:
    """
    Controller responsável pelas regras de negócio de Veículos e Matrículas (Arquitetura MVC).
    Persiste e consulta dados diretamente na tabela 'vehicles' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_vehicles(search: str = '') -> dict:
        ensure_seed_data()
        qs = Vehicle.objects.all()
        search = (search or '').strip()
        if search:
            qs = qs.filter(
                Q(plate__icontains=search) |
                Q(make__icontains=search) |
                Q(model__icontains=search) |
                Q(owner__icontains=search) |
                Q(driver__icontains=search) |
                Q(district__icontains=search)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': VehicleSerializer(qs, many=True).data
        }

    @staticmethod
    def get_vehicle(plate: str) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        vehicle = Vehicle.objects.filter(plate__iexact=clean_plate).first()
        if not vehicle:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado para a matrícula informada.'}
            }
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': VehicleSerializer(vehicle).data
        }

    @staticmethod
    def create_vehicle(data: dict) -> dict:
        ensure_seed_data()
        plate = str(data.get('plate') or '').strip().upper()
        make = str(data.get('make') or '').strip()
        model = str(data.get('model') or '').strip()
        owner = str(data.get('owner') or '').strip()
        driver = str(data.get('driver') or '').strip()
        district = str(data.get('district') or '').strip()
        category = str(data.get('category') or '').strip()

        try:
            year = int(data.get('year') or 2024)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'O ano do veículo deve ser um número válido.'}
            }

        try:
            tax_due = int(data.get('taxDue', data.get('tax_due', 0)) or 0)
        except (ValueError, TypeError):
            tax_due = 0

        if not plate or not make or not model or not owner or not district or not category:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Preencha todos os campos obrigatórios do veículo (Matrícula, Marca, Modelo, Ano, Proprietário, Categoria e Distrito).'}
            }

        if Vehicle.objects.filter(plate__iexact=plate).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Esta matrícula já está registada.'}
            }

        vehicle = Vehicle.objects.create(
            plate=plate,
            make=make,
            model=model,
            year=year,
            owner=owner,
            driver=driver,
            tax_due=tax_due,
            district=district,
            category=category,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': VehicleSerializer(vehicle).data
        }

    @staticmethod
    def update_vehicle(plate: str, data: dict) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        vehicle = Vehicle.objects.filter(plate__iexact=clean_plate).first()
        if not vehicle:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado.'}
            }

        serializer = VehicleSerializer(vehicle, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return {
                'success': True,
                'status_code': status.HTTP_200_OK,
                'data': serializer.data
            }
        return {
            'success': False,
            'status_code': status.HTTP_400_BAD_REQUEST,
            'data': {'error': 'Dados inválidos para atualização do veículo.', 'details': serializer.errors}
        }

    @staticmethod
    def delete_vehicle(plate: str) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        vehicle = Vehicle.objects.filter(plate__iexact=clean_plate).first()
        if not vehicle:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado.'}
            }
        vehicle.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }

