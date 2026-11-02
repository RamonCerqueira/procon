from django.contrib import admin
from .models import (
    Veiculo, HistoricoProprietario, Condutor, Multa, TipoInfracao, InspecaoVeicular, UsuarioSistema, ConfiguracaoSistema,
    Consumidor, Fornecedor, Processo, MensagemProcesso, Documento,
    Fiscalizacao, Superendividamento, Audiencia
)

admin.site.register(Veiculo)
admin.site.register(HistoricoProprietario)
admin.site.register(Condutor)
admin.site.register(Multa)
admin.site.register(TipoInfracao)
admin.site.register(InspecaoVeicular)
admin.site.register(UsuarioSistema)
admin.site.register(ConfiguracaoSistema)
admin.site.register(Consumidor)
admin.site.register(Fornecedor)
admin.site.register(Processo)
admin.site.register(MensagemProcesso)
admin.site.register(Documento)
admin.site.register(Fiscalizacao)
admin.site.register(Superendividamento)
admin.site.register(Audiencia)
