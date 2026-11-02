import time
from django.db import transaction
from django.db.models import Q
from rest_framework import status

from ..models import Condutor, RegistoCartaConducao, ExameCondutor
from ..serializers import CondutorSerializer, RegistoCartaConducaoSerializer, ExameCondutorSerializer
from ..seed import ensure_seed_data


class DriverController:
    """
    Controller responsável pela Gestão de Condutores (Arquitetura MVC):
    - Cadastro completo de condutores ('condutores')
    - Emissão de carta de condução ('registos_carta_conducao')
    - Categorias de habilitação A, B, C, D, E
    - Renovação e validade da carta
    - Suspensão e cassação da habilitação
    - Pontuação do condutor
    - Histórico de exames médicos e psicológicos ('exames_condutores')
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
                Q(categoria__icontains=search) |
                Q(distrito__icontains=search) |
                Q(status__icontains=search)
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
        data_emissao = str(data.get('issueDate') or data.get('data_emissao') or '2024-01-15').strip()
        data_validade = str(data.get('expiryDate') or data.get('data_validade') or '2029-01-15').strip()
        restricoes_medicas = str(data.get('medicalRestrictions') or data.get('restricoes_medicas') or 'Sem restrições').strip()
        try:
            pontuacao = int(data.get('points', data.get('pontuacao', 20)))
        except (ValueError, TypeError):
            pontuacao = 20
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
            data_emissao=data_emissao,
            data_validade=data_validade,
            pontuacao=pontuacao,
            restricoes_medicas=restricoes_medicas,
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
        if 'issueDate' in data or 'data_emissao' in data:
            condutor.data_emissao = str(data.get('issueDate') or data.get('data_emissao') or condutor.data_emissao).strip()
        if 'expiryDate' in data or 'data_validade' in data:
            condutor.data_validade = str(data.get('expiryDate') or data.get('data_validade') or condutor.data_validade).strip()
        if 'points' in data or 'pontuacao' in data:
            try:
                val = data.get('points') if 'points' in data else data.get('pontuacao')
                condutor.pontuacao = int(val)
            except (ValueError, TypeError):
                pass
        if 'medicalRestrictions' in data or 'restricoes_medicas' in data:
            condutor.restricoes_medicas = str(data.get('medicalRestrictions') or data.get('restricoes_medicas') or condutor.restricoes_medicas).strip()
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

    # ==========================================================================
    # Emissão, Renovação, Categorias, Suspensão/Cassação e Pontuação
    # ==========================================================================

    @staticmethod
    def list_license_records(driver_id: str = '', record_type: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = RegistoCartaConducao.objects.all()
        if driver_id:
            qs = qs.filter(condutor_codigo__iexact=driver_id.strip())
        if record_type:
            qs = qs.filter(tipo_registo__iexact=record_type.strip())
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=s) |
                Q(condutor_nome__icontains=s) |
                Q(carta__icontains=s) |
                Q(detalhe_acao__icontains=s) |
                Q(categoria__icontains=s) |
                Q(motivo_observacoes__icontains=s)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': RegistoCartaConducaoSerializer(qs, many=True).data
        }

    @staticmethod
    def create_license_record(data: dict) -> dict:
        ensure_seed_data()
        condutor_codigo = str(data.get('driverId') or data.get('condutor_codigo') or '').strip()
        condutor = Condutor.objects.filter(codigo__iexact=condutor_codigo).first()
        if not condutor:
            nome_busca = str(data.get('driverName') or data.get('condutor_nome') or '').strip()
            if nome_busca:
                condutor = Condutor.objects.filter(nome__iexact=nome_busca).first()
        if not condutor:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Selecione um condutor válido.'}
            }

        tipo_registo = str(data.get('recordType') or data.get('tipo_registo') or 'Emissão').strip()
        detalhe_acao = str(data.get('actionDetail') or data.get('detalhe_acao') or '').strip()
        categoria = str(data.get('category') or data.get('categoria') or condutor.categoria).strip()
        nova_carta = str(data.get('license') or data.get('carta') or condutor.carta).strip()
        data_emissao = str(data.get('issueDate') or data.get('data_emissao') or '').strip()
        data_validade = str(data.get('expiryDate') or data.get('data_validade') or '').strip()
        motivo_observacoes = str(data.get('notes') or data.get('motivo_observacoes') or '').strip()

        try:
            pontos_delta = int(data.get('pointsDelta') or data.get('pontos_delta') or 0)
        except (ValueError, TypeError):
            pontos_delta = 0

        codigo = str(data.get('id') or data.get('codigo') or f"RCC-2026-{str(int(time.time() * 1000))[-4:]}").strip()

        with transaction.atomic():
            registo = RegistoCartaConducao.objects.create(
                codigo=codigo,
                condutor_codigo=condutor.codigo,
                condutor_nome=condutor.nome,
                carta=nova_carta,
                tipo_registo=tipo_registo,
                detalhe_acao=detalhe_acao,
                categoria=categoria,
                data_emissao=data_emissao,
                data_validade=data_validade,
                pontos_delta=pontos_delta,
                motivo_observacoes=motivo_observacoes,
            )

            # Atualiza automaticamente o registo principal do condutor conforme a operação
            if nova_carta:
                condutor.carta = nova_carta
            if categoria:
                condutor.categoria = categoria
            if data_emissao:
                condutor.data_emissao = data_emissao
            if data_validade:
                condutor.data_validade = data_validade

            if tipo_registo == 'Suspensão / Cassação':
                acao_lower = detalhe_acao.lower()
                if 'cassação' in acao_lower or 'cassado' in acao_lower:
                    condutor.status = 'Cassado'
                elif 'reabilitação' in acao_lower or 'levantamento' in acao_lower or 'ativo' in acao_lower:
                    condutor.status = 'Ativo'
                else:
                    condutor.status = 'Suspenso'
            elif tipo_registo in ('Emissão', 'Renovação'):
                if condutor.status != 'Cassado':
                    condutor.status = 'Ativo'

            if pontos_delta != 0:
                condutor.pontuacao = max(0, min(30, condutor.pontuacao + pontos_delta))

            condutor.save()

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': {
                'record': RegistoCartaConducaoSerializer(registo).data,
                'driver': CondutorSerializer(condutor).data,
            }
        }

    @staticmethod
    def delete_license_record(code: str) -> dict:
        ensure_seed_data()
        obj = RegistoCartaConducao.objects.filter(codigo__iexact=(code or '').strip()).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Registo não encontrado.'}
            }
        obj.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }

    # ==========================================================================
    # Histórico de Exames Médicos e Psicológicos
    # ==========================================================================

    @staticmethod
    def list_driver_exams(driver_id: str = '', search: str = '') -> dict:
        ensure_seed_data()
        qs = ExameCondutor.objects.all()
        if driver_id:
            qs = qs.filter(condutor_codigo__iexact=driver_id.strip())
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(codigo__icontains=s) |
                Q(condutor_nome__icontains=s) |
                Q(carta__icontains=s) |
                Q(tipo_exame__icontains=s) |
                Q(resultado__icontains=s) |
                Q(entidade_medica__icontains=s) |
                Q(numero_atestado__icontains=s)
            )
        return {
            'success': True,
            'status_code': status.HTTP_200_OK,
            'data': ExameCondutorSerializer(qs, many=True).data
        }

    @staticmethod
    def create_driver_exam(data: dict) -> dict:
        ensure_seed_data()
        condutor_codigo = str(data.get('driverId') or data.get('condutor_codigo') or '').strip()
        condutor = Condutor.objects.filter(codigo__iexact=condutor_codigo).first()
        if not condutor:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Selecione um condutor válido.'}
            }

        codigo = str(data.get('id') or data.get('codigo') or f"EXM-2026-{str(int(time.time() * 1000))[-4:]}").strip()
        categoria_pretendida = str(data.get('targetCategory') or data.get('categoria_pretendida') or condutor.categoria).strip()
        tipo_exame = str(data.get('examType') or data.get('tipo_exame') or 'Exame Médico de Aptidão Física').strip()
        resultado = str(data.get('result') or data.get('resultado') or 'Apto').strip()
        entidade_medica = str(data.get('medicalEntity') or data.get('entidade_medica') or '').strip()
        numero_atestado = str(data.get('certificateNumber') or data.get('numero_atestado') or '').strip()
        restricoes = str(data.get('restrictions') or data.get('restricoes') or 'Sem restrições').strip()
        data_exame = str(data.get('examDate') or data.get('data_exame') or '').strip()
        validade_exame = str(data.get('expiryDate') or data.get('validade_exame') or '').strip()

        with transaction.atomic():
            exame = ExameCondutor.objects.create(
                codigo=codigo,
                condutor_codigo=condutor.codigo,
                condutor_nome=condutor.nome,
                carta=condutor.carta,
                categoria_pretendida=categoria_pretendida,
                tipo_exame=tipo_exame,
                resultado=resultado,
                entidade_medica=entidade_medica,
                numero_atestado=numero_atestado,
                restricoes=restricoes,
                data_exame=data_exame,
                validade_exame=validade_exame,
            )

            if restricoes:
                condutor.restricoes_medicas = restricoes
                condutor.save()

        return {
            'success': True,
            'status_code': status.HTTP_201_CREATED,
            'data': {
                'exam': ExameCondutorSerializer(exame).data,
                'driver': CondutorSerializer(condutor).data,
            }
        }

    @staticmethod
    def delete_driver_exam(code: str) -> dict:
        ensure_seed_data()
        obj = ExameCondutor.objects.filter(codigo__iexact=(code or '').strip()).first()
        if not obj:
            return {
                'success': False,
                'status_code': status.HTTP_404_NOT_FOUND,
                'data': {'error': 'Exame não encontrado.'}
            }
        obj.delete()
        return {
            'success': True,
            'status_code': status.HTTP_204_NO_CONTENT,
            'data': None
        }
