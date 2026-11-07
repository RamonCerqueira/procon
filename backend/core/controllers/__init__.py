from .auth_controller import AuthController
from .vehicle_controller import VehicleController
from .driver_controller import DriverController
from .fine_controller import FineController
from .infraction_controller import InfractionController
from .ownership_controller import OwnershipController
from .vehicle_status_controller import VehicleStatusController
from .document_controller import DocumentController
from .state_fleet_controller import StateFleetController
from .accident_controller import AccidentController
from .smart_inspection_controller import SmartInspectionController

__all__ = [
    'AuthController',
    'VehicleController',
    'DriverController',
    'FineController',
    'InfractionController',
    'OwnershipController',
    'VehicleStatusController',
    'DocumentController',
    'StateFleetController',
    'AccidentController',
    'SmartInspectionController',
]
