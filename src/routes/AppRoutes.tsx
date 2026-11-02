import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  CirculationTax,
  DigitalDrivingLicensePage,
  DocumentAdministrativeBlockPage,
  DocumentIssuanceHistoryPage,
  DocumentSecondCopyPage,
  DriverCategoriesPage,
  DriverExamsPage,
  DriverInfractionsHistoryPage,
  DriverLicenseIssuePage,
  DriverPointsPage,
  DriverRegistry,
  DriverRenewalPage,
  DriverSuspensionPage,
  FineAdministrativeBlocksPage,
  FineAgentsPage,
  FineAmountsPage,
  FineAppealsPage,
  FineEvidencePage,
  FineManagement,
  FinePaymentsPage,
  FineRecidivismPage,
  FineSeverityPage,
  InfractionCatalog,
  InspectionManagement,
  OwnershipCertificatePage,
  OwnershipTransferAndHistory,
  PlateCheck,
  PublicAuthenticityVerificationPage,
  QRCodeValidationPage,
  RegistrationCertificatePage,
  ReportsManagement,
  SystemAdministration,
  TransportDashboard,
  TransportLanding,
  VehicleIdentificationDocPage,
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
    <Route path="/drivers/license-issue" element={<Protected><DriverLicenseIssuePage/></Protected>}/>
    <Route path="/drivers/categories" element={<Protected><DriverCategoriesPage/></Protected>}/>
    <Route path="/drivers/renewals" element={<Protected><DriverRenewalPage/></Protected>}/>
    <Route path="/drivers/suspensions" element={<Protected><DriverSuspensionPage/></Protected>}/>
    <Route path="/drivers/infractions-history" element={<Protected><DriverInfractionsHistoryPage/></Protected>}/>
    <Route path="/drivers/points" element={<Protected><DriverPointsPage/></Protected>}/>
    <Route path="/drivers/exams" element={<Protected><DriverExamsPage/></Protected>}/>
    <Route path="/circulation-tax" element={<Protected><CirculationTax/></Protected>}/>
    <Route path="/fines" element={<Protected><FineManagement/></Protected>}/>
    <Route path="/fines/severity" element={<Protected><FineSeverityPage/></Protected>}/>
    <Route path="/fines/amounts" element={<Protected><FineAmountsPage/></Protected>}/>
    <Route path="/fines/evidence" element={<Protected><FineEvidencePage/></Protected>}/>
    <Route path="/fines/agents" element={<Protected><FineAgentsPage/></Protected>}/>
    <Route path="/fines/payments" element={<Protected><FinePaymentsPage/></Protected>}/>
    <Route path="/fines/appeals" element={<Protected><FineAppealsPage/></Protected>}/>
    <Route path="/fines/recidivism" element={<Protected><FineRecidivismPage/></Protected>}/>
    <Route path="/fines/administrative-blocks" element={<Protected><FineAdministrativeBlocksPage/></Protected>}/>
    <Route path="/infraction-types" element={<Protected><InfractionCatalog/></Protected>}/>
    <Route path="/documents-certificates" element={<Protected><VehicleIdentificationDocPage/></Protected>}/>
    <Route path="/documents-certificates/registration-certificate" element={<Protected><RegistrationCertificatePage/></Protected>}/>
    <Route path="/documents-certificates/digital-license" element={<Protected><DigitalDrivingLicensePage/></Protected>}/>
    <Route path="/documents-certificates/ownership-certificate" element={<Protected><OwnershipCertificatePage/></Protected>}/>
    <Route path="/documents-certificates/history" element={<Protected><DocumentIssuanceHistoryPage/></Protected>}/>
    <Route path="/documents-certificates/second-copy" element={<Protected><DocumentSecondCopyPage/></Protected>}/>
    <Route path="/documents-certificates/qr-validation" element={<Protected><QRCodeValidationPage/></Protected>}/>
    <Route path="/documents-certificates/authenticity" element={<PublicAuthenticityVerificationPage/>}/>
    <Route path="/documents-certificates/administrative-blocks" element={<Protected><DocumentAdministrativeBlockPage/></Protected>}/>
    <Route path="/inspections" element={<Protected><InspectionManagement/></Protected>}/>
    <Route path="/reports" element={<Protected><ReportsManagement/></Protected>}/>
    <Route path="/users" element={<Protected><SystemAdministration/></Protected>}/>
    <Route path="/settings" element={<Protected><SystemAdministration settings/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Suspense>;
}
