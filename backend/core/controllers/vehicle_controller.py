from django.db.models import Q
from rest_framework import status

from ..models import Veiculo
from ..serializers import VeiculoSerializer
from ..seed import ensure_seed_data


class VehicleController:
    """
    Controller responsável pelas regras de negócio de Veículos e Matrículas (Arquitetura MVC).
    Persiste e consulta dados diretamente na tabela 'veiculos' do banco PostgreSQL 'procon'.
    """

    @staticmethod
    def list_vehicles(search: str = '') -> dict:
        ensure_seed_data()
        qs = Veiculo.objects.all()
        search = (search or '').strip()
        if search:
            qs = qs.filter(
                Q(placa__icontains=search) |
                Q(marca__icontains=search) |
                Q(modelo__icontains=search) |
                Q(cor__icontains=search) |
                Q(proprietario__icontains=search) |
                Q(condutor__icontains=search) |
                Q(distrito__icontains=search) |
                Q(situacao_legal__icontains=search)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': VeiculoSerializer(qs, many=True).data
        }

    @staticmethod
    def get_vehicle(plate: str) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        veiculo = Veiculo.objects.filter(placa__iexact=clean_plate).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado para a matrícula informada.'}
            }
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': VeiculoSerializer(veiculo).data
        }

    @staticmethod
    def create_vehicle(data: dict) -> dict:
        ensure_seed_data()
        placa = str(data.get('plate') or data.get('placa') or '').strip().upper()
        marca = str(data.get('make') or data.get('marca') or '').strip()
        modelo = str(data.get('model') or data.get('modelo') or '').strip()
        cor = str(data.get('color') or data.get('cor') or 'Branco').strip() or 'Branco'
        proprietario = str(data.get('owner') or data.get('proprietario') or '').strip()
        condutor = str(data.get('driver') or data.get('condutor') or '').strip()
        distrito = str(data.get('district') or data.get('distrito') or '').strip()
        categoria = str(data.get('category') or data.get('categoria') or '').strip()
        situacao_legal = str(data.get('legalStatus') or data.get('situacao_legal') or 'Regular').strip() or 'Regular'

        try:
            ano = int(data.get('year') or data.get('ano') or 2024)
        except (ValueError, TypeError):
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'O ano do veículo deve ser um número válido.'}
            }

        try:
            imposto_devido = int(data.get('taxDue', data.get('imposto_devido', 0)) or 0)
        except (ValueError, TypeError):
            imposto_devido = 0

        if not placa or not marca or not modelo or not proprietario or not distrito or not categoria:
            return {
                'success': False,
                'status_code': status.HTTP_400_BAD_REQUEST,
                'data': {'error': 'Preencha todos os campos obrigatórios do veículo (Matrícula, Marca, Modelo, Ano, Cor, Proprietário, Categoria e Distrito).'}
            }

        if Veiculo.objects.filter(placa__iexact=placa).exists():
            return {
                'success': False,
                'status_code': status.HTTP_409_CONFLICT,
                'data': {'error': 'Esta matrícula já está registada.'}
            }

        veiculo = Veiculo.objects.create(
            placa=placa,
            marca=marca,
            modelo=modelo,
            ano=ano,
            cor=cor,
            proprietario=proprietario,
            condutor=condutor,
            imposto_devido=imposto_devido,
            distrito=distrito,
            categoria=categoria,
            situacao_legal=situacao_legal,
        )

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': VeiculoSerializer(veiculo).data
        }

    @staticmethod
    def update_vehicle(plate: str, data: dict) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        veiculo = Veiculo.objects.filter(placa__iexact=clean_plate).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado.'}
            }

        if 'make' in data or 'marca' in data:
            marca = str(data.get('make') or data.get('marca') or '').strip()
            if marca:
                veiculo.marca = marca
        if 'model' in data or 'modelo' in data:
            modelo = str(data.get('model') or data.get('modelo') or '').strip()
            if modelo:
                veiculo.modelo = modelo
        if 'year' in data or 'ano' in data:
            try:
                veiculo.ano = int(data.get('year') or data.get('ano') or veiculo.ano)
            except (ValueError, TypeError):
                return {
                    'success': False,
                    'status_code': status.HTTP_400_BAD_REQUEST,
                    'data': {'error': 'O ano do veículo deve ser um número válido.'}
                }
        if 'color' in data or 'cor' in data:
            cor = str(data.get('color') or data.get('cor') or '').strip()
            if cor:
                veiculo.cor = cor
        if 'owner' in data or 'proprietario' in data:
            proprietario = str(data.get('owner') or data.get('proprietario') or '').strip()
            if proprietario:
                veiculo.proprietario = proprietario
        if 'driver' in data or 'condutor' in data:
            veiculo.condutor = str(data.get('driver') if 'driver' in data else data.get('condutor') or '').strip()
        if 'taxDue' in data or 'imposto_devido' in data:
            try:
                val = data.get('taxDue') if 'taxDue' in data else data.get('imposto_devido')
                veiculo.imposto_devido = int(val or 0)
            except (ValueError, TypeError):
                pass
        if 'district' in data or 'distrito' in data:
            distrito = str(data.get('district') or data.get('distrito') or '').strip()
            if distrito:
                veiculo.distrito = distrito
        if 'category' in data or 'categoria' in data:
            categoria = str(data.get('category') or data.get('categoria') or '').strip()
            if categoria:
                veiculo.categoria = categoria
        if 'legalStatus' in data or 'situacao_legal' in data:
            situacao = str(data.get('legalStatus') or data.get('situacao_legal') or '').strip()
            if situacao:
                veiculo.situacao_legal = situacao

        veiculo.save()
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': VeiculoSerializer(veiculo).data
        }

    @staticmethod
    def delete_vehicle(plate: str) -> dict:
        ensure_seed_data()
        clean_plate = (plate or '').strip().upper()
        veiculo = Veiculo.objects.filter(placa__iexact=clean_plate).first()
        if not veiculo:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Veículo não encontrado.'}
            }
        veiculo.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }
