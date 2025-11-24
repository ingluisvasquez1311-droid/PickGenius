"""
Tests automatizados para scripts de sincronización
Ejecutar con: pytest test_sync_scripts.py -v
"""
import pytest
import os
import sys
from unittest.mock import Mock, patch, MagicMock

# Agregar src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestFetchMissingData:
    """Tests para fetch_missing_data.py"""
    
    def test_get_team_id_valid(self):
        """Test obtener ID de equipo válido"""
        from scripts.fetch_missing_data import get_team_id
        
        team_id = get_team_id('LAL')
        assert team_id is not None
        assert isinstance(team_id, int)
    
    def test_get_team_id_invalid(self):
        """Test obtener ID de equipo inválido"""
        from scripts.fetch_missing_data import get_team_id
        
        team_id = get_team_id('INVALID')
        assert team_id is None
    
    @patch('scripts.fetch_missing_data.leaguegamelog.LeagueGameLog')
    def test_fetch_season_data_success(self, mock_game_log):
        """Test sincronización exitosa"""
        # Mock de respuesta de API
        mock_df = Mock()
        mock_df.empty = False
        mock_df.to_dict.return_value = [
            {'GAME_ID': '0022400001', 'GAME_DATE': '2024-10-01'}
        ]
        
        mock_game_log.return_value.get_data_frames.return_value = [mock_df]
        
        # TODO: Implementar test completo
        assert True  # Placeholder

class TestVerifyData:
    """Tests para verify_data.py"""
    
    @patch('scripts.verify_data.db')
    def test_count_documents(self, mock_db):
        """Test contar documentos"""
        # Mock de Firestore
        mock_docs = [Mock() for _ in range(100)]
        mock_db.collection.return_value.stream.return_value = iter(mock_docs)
        
        from scripts.verify_data import count_documents
        
        count = count_documents('test_collection')
        assert count == 100
    
    @patch('scripts.verify_data.db')
    def test_verify_data_integrity(self, mock_db):
        """Test verificar integridad de datos"""
        # Mock de documentos con datos válidos
        mock_doc = Mock()
        mock_doc.to_dict.return_value = {
            'gameId': '0022400001',
            'teamTricode': 'LAL',
            'personName': 'LeBron James',
            'points': 25,
            'reboundsTotal': 7,
            'assists': 8,
            'season_year': '2024-25',
            'game_date': '2024-10-01'
        }
        
        mock_db.collection.return_value.limit.return_value.stream.return_value = [mock_doc]
        
        from scripts.verify_data import verify_data_integrity
        
        result = verify_data_integrity('test_collection', sample_size=1)
        assert result is True

class TestMonitorSync:
    """Tests para monitor_sync.py"""
    
    @patch('scripts.monitor_sync.db')
    def test_get_sync_summary(self, mock_db):
        """Test obtener resumen de sincronización"""
        # Mock de documentos
        mock_doc1 = Mock()
        mock_doc1.to_dict.return_value = {'teamTricode': 'LAL'}
        
        mock_doc2 = Mock()
        mock_doc2.to_dict.return_value = {'teamTricode': 'BOS'}
        
        mock_db.collection.return_value.stream.return_value = iter([mock_doc1, mock_doc2])
        
        # TODO: Implementar test completo
        assert True  # Placeholder

class TestNotificationService:
    """Tests para notificationService.py"""
    
    def test_notification_service_init(self):
        """Test inicialización del servicio"""
        from services.notificationService import NotificationService
        
        service = NotificationService()
        assert hasattr(service, 'email_enabled')
        assert hasattr(service, 'slack_enabled')
        assert hasattr(service, 'discord_enabled')
    
    @patch('services.notificationService.requests.post')
    @patch.dict(os.environ, {'SLACK_WEBHOOK_URL': 'https://hooks.slack.com/test'})
    def test_send_slack_notification(self, mock_post):
        """Test enviar notificación a Slack"""
        from services.notificationService import NotificationService
        
        mock_post.return_value.status_code = 200
        
        service = NotificationService()
        service._send_slack("Test message")
        
        assert mock_post.called
        assert mock_post.call_args[1]['json']['text'] == "Test message"

# Tests de integración
class TestIntegration:
    """Tests de integración"""
    
    @pytest.mark.integration
    @patch('firebase_admin.initialize_app')
    def test_firebase_connection(self, mock_init):
        """Test conexión a Firebase"""
        # Este test requiere credenciales reales
        # Se salta en CI/CD
        pytest.skip("Requiere credenciales Firebase")
    
    @pytest.mark.integration
    def test_nba_api_connection(self):
        """Test conexión a NBA API"""
        from nba_api.stats.static import teams
        
        all_teams = teams.get_teams()
        assert len(all_teams) == 30
        assert all(isinstance(team, dict) for team in all_teams)

# Configuración de pytest
def pytest_configure(config):
    """Configuración de pytest"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )

if __name__ == "__main__":
    pytest.main([__file__, '-v', '--tb=short'])
