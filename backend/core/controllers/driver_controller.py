import time
from django.db.models import Q
from rest_framework import status

from ..models import Driver
from ..serializers import DriverSerializer
from ..seed import ensure_seed_data


class DriverController:
    """
    Controller responsável pelas regras de negócio de Condutores e Cartas (Arquitetura MVC).
    Persiste, edita e remove registos na tabela 'drivers' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_drivers(search: str = '') -> dict:
        ensure_seed_data()
        qs = Driver.objects.all()
        search = (search or '').strip()
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(name__icontains=search) |
                Q(document__icontains=search) |
                Q(license__icontains=search) |
                Q(district__icontains=search)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': DriverSerializer(qs, many=True).data
        }

    @staticmethod
    def get_driver(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        driver = Driver.objects.filter(code__iexact=clean_code).first()
        if not driver:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': DriverSerializer(driver).data
        }

    @staticmethod
    def create_driver(data: dict) -> dict:
        ensure_seed_data()
        code = str(data.get('id') or data.get('code') or f"D-{str(int(time.time() * 1000))[-5:]}").strip()
        name = str(data.get('name') or '').strip()
        document = str(data.get('document') or '').strip()
        license_no = str(data.get('license') or '').strip()
        category = str(data.get('category') or '').strip()
        phone = str(data.get('phone') or '').strip()
        district = str(data.get('district') or '').strip()
        driver_status = str(data.get('status') or 'Ativo').strip()
        document_file = data.get('documentFile', data.get('document_file'))

        if not name or not document or not license_no or not category or not phone or not district:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Preencha todos os campos obrigatórios do condutor.'}
            }

        while Driver.objects.filter(code__iexact=code).exists():
            code = f"D-{str(int(time.time() * 1000))[-5:]}"

        driver = Driver.objects.create(
            code=code,
            name=name,
            document=document,
            document_file=document_file,
            license=license_no,
            category=category,
            phone=phone,
            district=district,
            status=driver_status,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': DriverSerializer(driver).data
        }

    @staticmethod
    def update_driver(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        driver = Driver.objects.filter(code__iexact=clean_code).first()
        if not driver:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }

        if 'name' in data:
            driver.name = str(data.get('name') or driver.name).strip()
        if 'document' in data:
            driver.document = str(data.get('document') or driver.document).strip()
        if 'license' in data:
            driver.license = str(data.get('license') or driver.license).strip()
        if 'category' in data:
            driver.category = str(data.get('category') or driver.category).strip()
        if 'phone' in data:
            driver.phone = str(data.get('phone') or driver.phone).strip()
        if 'district' in data:
            driver.district = str(data.get('district') or driver.district).strip()
        if 'status' in data:
            driver.status = str(data.get('status') or driver.status).strip()
        if 'documentFile' in data and data.get('documentFile') is not None:
            driver.document_file = data.get('documentFile')

        driver.save()

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': DriverSerializer(driver).data
        }

    @staticmethod
    def delete_driver(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        driver = Driver.objects.filter(code__iexact=clean_code).first()
        if not driver:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }
        driver.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }

