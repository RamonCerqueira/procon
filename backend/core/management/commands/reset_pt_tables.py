from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from core.seed import ensure_seed_data


class Command(BaseCommand):
    help = 'Remove as tabelas antigas em inglês, aplica as novas tabelas em português e popula os dados iniciais.'

    def handle(self, *args, **options):
        old_tables = [
            'case_messages', 'cases', 'consumers', 'suppliers', 'documents',
            'procon_inspections', 'overindebtedness', 'hearings',
            'vehicles', 'drivers', 'fines', 'infraction_types',
            'vehicle_inspections', 'system_users', 'system_config',
        ]
        with connection.cursor() as cursor:
            for tbl in old_tables:
                cursor.execute(f'DROP TABLE IF EXISTS "{tbl}" CASCADE;')
            cursor.execute("DELETE FROM django_migrations WHERE app = 'core';")

        call_command('migrate')
        ensure_seed_data()
        self.stdout.write(self.style.SUCCESS('Tabelas em português criadas e populadas com sucesso no banco procon!'))

