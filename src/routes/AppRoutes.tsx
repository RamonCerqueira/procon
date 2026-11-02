import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  CirculationTax,
  DriverRegistry,
  FineManagement,
  InfractionCatalog,
  InspectionManagement,
  OwnershipTransferAndHistory,
  PlateCheck,
  ReportsManagement,
  SystemAdministration,
  TransportDashboard,
  TransportLanding,
  VehicleLegalStatusAndWriteOff,
  VehicleRegistry,
} from '../modules/transport/TransportPortal';

const Login = React.lazy(() => import('../modules/auth/Login').then(module => ({ default: module.Login })));
const PageLoader = () => <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700"/></div>;

function Protected({ children }: { children: React.ReactNode }) {
  const authenticated = useAuthStore(state => state.isAuthenticated);
  return authenticated ? <>{children}</> : <Navigate to="/login" replace/>;
}

export function AppRoutes() {
  return <Suspense fallback={<PageLoader/>}><Routes>
    <Route path="/" element={<TransportLanding/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/plate-check" element={<PlateCheck/>}/>
    <Route path="/dashboard" element={<Protected><TransportDashboard/></Protected>}/>
    <Route path="/vehicles" element={<Protected><VehicleRegistry/></Protected>}/>
    <Route path="/ownership-transfers" element={<Protected><OwnershipTransferAndHistory/></Protected>}/>
    <Route path="/vehicle-occurrences" element={<Protected><VehicleLegalStatusAndWriteOff/></Protected>}/>
    <Route path="/drivers" element={<Protected><DriverRegistry/></Protected>}/>
    <Route path="/circulation-tax" element={<Protected><CirculationTax/></Protected>}/>
    <Route path="/fines" element={<Protected><FineManagement/></Protected>}/>
    <Route path="/infraction-types" element={<Protected><InfractionCatalog/></Protected>}/>
    <Route path="/inspections" element={<Protected><InspectionManagement/></Protected>}/>
    <Route path="/reports" element={<Protected><ReportsManagement/></Protected>}/>
    <Route path="/users" element={<Protected><SystemAdministration/></Protected>}/>
    <Route path="/settings" element={<Protected><SystemAdministration settings/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Suspense>;
}
