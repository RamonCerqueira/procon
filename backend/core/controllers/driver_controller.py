import time
from django.db.models import Q
from rest_framework import status

from ..models import Condutor
from ..serializers import CondutorSerializer
from ..seed import ensure_seed_data


class DriverController:
    """
    Controller responsável pelas regras de negócio de Condutores e Cartas (Arquitetura MVC).
    Persiste, edita e remove registos na tabela 'condutores' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_drivers(search: str = '') -> dict:
        ensure_seed_data()
        qs = Condutor.objects.all()
        search = (search or '').strip()
        if search:
            qs = qs.filter(
                Q(codigo__icontains=search) |
                Q(nome__icontains=search) |
                Q(documento__icontains=search) |
                Q(carta__icontains=search) |
                Q(distrito__icontains=search)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': CondutorSerializer(qs, many=True).data
        }

    @staticmethod
    def get_driver(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        condutor = Condutor.objects.filter(codigo__iexact=clean_code).first()
        if not condutor:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': CondutorSerializer(condutor).data
        }

    @staticmethod
    def create_driver(data: dict) -> dict:
        ensure_seed_data()
        codigo = str(data.get('id') or data.get('codigo') or f"D-{str(int(time.time() * 1000))[-5:]}").strip()
        nome = str(data.get('name') or data.get('nome') or '').strip()
        documento = str(data.get('document') or data.get('documento') or '').strip()
        carta = str(data.get('license') or data.get('carta') or '').strip()
        categoria = str(data.get('category') or data.get('categoria') or '').strip()
        telefone = str(data.get('phone') or data.get('telefone') or '').strip()
        distrito = str(data.get('district') or data.get('distrito') or '').strip()
        driver_status = str(data.get('status') or 'Ativo').strip()
        arquivo_documento = data.get('documentFile', data.get('arquivo_documento'))

        if not nome or not documento or not carta or not categoria or not telefone or not distrito:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Preencha todos os campos obrigatórios do condutor.'}
            }

        while Condutor.objects.filter(codigo__iexact=codigo).exists():
            codigo = f"D-{str(int(time.time() * 1000))[-5:]}"

        condutor = Condutor.objects.create(
            codigo=codigo,
            nome=nome,
            documento=documento,
            arquivo_documento=arquivo_documento,
            carta=carta,
            categoria=categoria,
            telefone=telefone,
            distrito=distrito,
            status=driver_status,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': CondutorSerializer(condutor).data
        }

    @staticmethod
    def update_driver(code: str, data: dict) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        condutor = Condutor.objects.filter(codigo__iexact=clean_code).first()
        if not condutor:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }

        if 'name' in data or 'nome' in data:
            condutor.nome = str(data.get('name') or data.get('nome') or condutor.nome).strip()
        if 'document' in data or 'documento' in data:
            condutor.documento = str(data.get('document') or data.get('documento') or condutor.documento).strip()
        if 'license' in data or 'carta' in data:
            condutor.carta = str(data.get('license') or data.get('carta') or condutor.carta).strip()
        if 'category' in data or 'categoria' in data:
            condutor.categoria = str(data.get('category') or data.get('categoria') or condutor.categoria).strip()
        if 'phone' in data or 'telefone' in data:
            condutor.telefone = str(data.get('phone') or data.get('telefone') or condutor.telefone).strip()
        if 'district' in data or 'distrito' in data:
            condutor.distrito = str(data.get('district') or data.get('distrito') or condutor.distrito).strip()
        if 'status' in data:
            condutor.status = str(data.get('status') or condutor.status).strip()
        if 'documentFile' in data and data.get('documentFile') is not None:
            condutor.arquivo_documento = data.get('documentFile')

        condutor.save()

        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': CondutorSerializer(condutor).data
        }

    @staticmethod
    def delete_driver(code: str) -> dict:
        ensure_seed_data()
        clean_code = (code or '').strip()
        condutor = Condutor.objects.filter(codigo__iexact=clean_code).first()
        if not condutor:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Condutor não encontrado.'}
            }
        condutor.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }
