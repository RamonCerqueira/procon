import time
from datetime import date
from django.db.models import Q
from rest_framework import status

from ..models import DocumentoCertificado, Veiculo, Condutor
from ..serializers import DocumentoCertificadoSerializer
from ..seed import ensure_seed_data


class DocumentController:
    """
    Controller (Arquitetura MVC) responsável pela lógica de negócio
    de Documentação e Certificados Oficiais (SIGETRAN):
    - Documento de identificação do veículo
    - Certificado de matrícula
    - Carta de condução digital
    - Certificado de propriedade
    - Histórico de emissão de documentos
    - Segunda via
    - Validação por QR Code
    - Verificação pública de autenticidade
    - Bloqueio administrativo quando legalmente autorizado
    """

    @staticmethod
    def list_documents(doc_type: str = '', search: str = '') -> dict:
        ensure_seed_data()
        queryset = DocumentoCertificado.objects.all()
        if doc_type:
            queryset = queryset.filter(tipo_documento__iexact=doc_type.strip())
        if search:
            q = search.strip()
            queryset = queryset.filter(
                Q(codigo__icontains=q)
                | Q(tipo_documento__icontains=q)
                | Q(referencia_vinculada__icontains=q)
                | Q(titular_nome__icontains=q)
                | Q(codigo_autenticidade__icontains=q)
            )
        return {
            'data': DocumentoCertificadoSerializer(queryset, many=True).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def create_document(payload: dict) -> dict:
        ensure_seed_data()
        codigo = str(payload.get('id', '')).strip() or f"DOC-2026-{str(int(time.time() * 1000))[-4:]}"
        tipo_documento = str(payload.get('documentType', 'Documento de Identificação do Veículo')).strip()
        modalidade_emissao = str(payload.get('issueMode', '1.ª Via Original')).strip() or '1.ª Via Original'
        referencia_vinculada = str(payload.get('targetRef', '')).strip().upper()
        titular_nome = str(payload.get('holderName', '')).strip()
        titular_documento = str(payload.get('holderDocument', '')).strip()
        detalhes_tecnicos = str(payload.get('technicalDetails', '')).strip()

        if not referencia_vinculada:
            return {
                'data': {'error': 'Informe a matrícula do veículo ou número da carta de condução vinculada.'},
                'status_code': status.HTTP_400_BAD_REQUEST,
            }

        # Preenchimento automático a partir do veículo ou condutor caso não informado
        if not titular_nome or not detalhes_tecnicos:
            veiculo = Veiculo.objects.filter(placa__iexact=referencia_vinculada).first()
            if veiculo:
                if not titular_nome:
                    titular_nome = veiculo.proprietario
                if not detalhes_tecnicos:
                    detalhes_tecnicos = f"{veiculo.marca} {veiculo.modelo} ({veiculo.ano}) · Cor: {veiculo.cor} · Cat.: {veiculo.categoria}"
            else:
                condutor = Condutor.objects.filter(
                    Q(carta__iexact=referencia_vinculada) | Q(codigo__iexact=referencia_vinculada)
                ).first()
                if condutor:
                    referencia_vinculada = condutor.carta
                    if not titular_nome:
                        titular_nome = condutor.nome
                    if not titular_documento:
                        titular_documento = condutor.documento
                    if not detalhes_tecnicos:
                        detalhes_tecnicos = f"Categorias: {condutor.categoria} · Restrições: {condutor.restricoes_medicas}"

        if not titular_nome:
            titular_nome = 'Titular Registado na Base Nacional'

        # Se for emissão de 2.ª via, marca documentos anteriores do mesmo tipo e referência como substituídos
        if '2.ª Via' in modalidade_emissao or 'Segunda Via' in modalidade_emissao or tipo_documento == 'Segunda Via':
            DocumentoCertificado.objects.filter(
                referencia_vinculada__iexact=referencia_vinculada,
                tipo_documento__iexact=tipo_documento,
                status='Válido'
            ).update(status='Substituído (2.ª Via)')

        suffix = str(int(time.time() * 1000))[-4:]
        codigo_autenticidade = (
            str(payload.get('authenticityCode', '')).strip()
            or f"AUTH-GB-2026-{suffix}-{referencia_vinculada.replace('-', '')[-3:] or 'X9'}"
        )
        assinatura_qr = (
            str(payload.get('qrPayload', '')).strip()
            or f"SIGETRAN-QR|{codigo}|{referencia_vinculada}|{codigo_autenticidade}"
        )

        doc = DocumentoCertificado.objects.create(
            codigo=codigo,
            tipo_documento=tipo_documento,
            modalidade_emissao=modalidade_emissao,
            referencia_vinculada=referencia_vinculada,
            titular_nome=titular_nome,
            titular_documento=titular_documento,
            detalhes_tecnicos=detalhes_tecnicos,
            codigo_autenticidade=codigo_autenticidade,
            assinatura_qr=assinatura_qr,
            delegacao_emissora=str(payload.get('issuingOffice', 'Direção-Geral de Viação · Bissau')).strip(),
            data_emissao=str(payload.get('issueDate') or date.today().isoformat()),
            data_validade=str(payload.get('expiryDate', 'Permanente')).strip() or 'Permanente',
            status=str(payload.get('status', 'Válido')).strip() or 'Válido',
            bloqueio_administrativo=bool(payload.get('administrativeBlock', False)),
            motivo_bloqueio=str(payload.get('blockReason', '')).strip(),
            observacoes=str(payload.get('notes', '')).strip(),
        )

        return {
            'data': DocumentoCertificadoSerializer(doc).data,
            'status_code': status.HTTP_201_CREATED,
        }

    @staticmethod
    def update_document(code: str, payload: dict) -> dict:
        ensure_seed_data()
        doc = DocumentoCertificado.objects.filter(codigo__iexact=code.strip()).first()
        if not doc:
            return {
                'data': {'error': 'Documento ou certificado não encontrado.'},
                'status_code': status.HTTP_404_NOT_FOUND,
            }

        if 'status' in payload:
            doc.status = str(payload['status']).strip()
        if 'administrativeBlock' in payload:
            is_blocked = bool(payload['administrativeBlock'])
            doc.bloqueio_administrativo = is_blocked
            doc.status = 'Bloqueado' if is_blocked else 'Válido'
        if 'blockReason' in payload:
            doc.motivo_bloqueio = str(payload.get('blockReason') or '').strip()
        if 'notes' in payload:
            doc.observacoes = str(payload.get('notes') or '').strip()
        if 'expiryDate' in payload:
            doc.data_validade = str(payload.get('expiryDate') or doc.data_validade).strip()

        doc.save()
        return {
            'data': DocumentoCertificadoSerializer(doc).data,
            'status_code': status.HTTP_200_OK,
        }

    @staticmethod
    def delete_document(code: str) -> dict:
        ensure_seed_data()
        deleted, _ = DocumentoCertificado.objects.filter(codigo__iexact=code.strip()).delete()
        if not deleted:
            return {'data': {'error': 'Documento não encontrado.'}, 'status_code': status.HTTP_404_NOT_FOUND}
        return {'data': None, 'status_code': status.HTTP_204_NO_CONTENT}

    @staticmethod
    def verify_authenticity(query: str) -> dict:
        ensure_seed_data()
        q = query.strip()
        if not q:
            return {
                'data': {'valid': False, 'error': 'Informe o código de autenticidade, número do documento ou payload QR Code.'},
                'status_code': status.HTTP_400_BAD_REQUEST,
            }

        doc = DocumentoCertificado.objects.filter(
            Q(codigo_autenticidade__iexact=q)
            | Q(codigo__iexact=q)
            | Q(assinatura_qr__iexact=q)
            | Q(referencia_vinculada__iexact=q)
        ).first()

        if not doc:
            return {
                'data': {
                    'valid': False,
                    'message': 'Nenhum certificado ou documento oficial corresponde ao código ou QR Code informado.',
                },
                'status_code': status.HTTP_200_OK,
            }

        is_valid = doc.status == 'Válido' and not doc.bloqueio_administrativo
        return {
            'data': {
                'valid': is_valid,
                'message': (
                    'Documento autêntico e válido na Base Nacional do Ministério dos Transportes.'
                    if is_valid
                    else f'Atenção: Documento localizado, mas com restrição ativa ({doc.status}).'
                ),
                'document': DocumentoCertificadoSerializer(doc).data,
            },
            'status_code': status.HTTP_200_OK,
        }

