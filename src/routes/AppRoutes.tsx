import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

// Lazy load modules
const LandingPage = React.lazy(() => import('../modules/public/LandingPage').then(module => ({ default: module.LandingPage })));
const Login = React.lazy(() => import('../modules/auth/Login').then(module => ({ default: module.Login })));
const Dashboard = React.lazy(() => import('../modules/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const ConsumerList = React.lazy(() => import('../modules/consumers/pages/ConsumerList').then(module => ({ default: module.ConsumerList })));
const ConsumerForm = React.lazy(() => import('../modules/consumers/pages/ConsumerForm').then(module => ({ default: module.ConsumerForm })));
const SupplierList = React.lazy(() => import('../modules/suppliers/pages/SupplierList').then(module => ({ default: module.SupplierList })));
const SupplierForm = React.lazy(() => import('../modules/suppliers/pages/SupplierForm').then(module => ({ default: module.SupplierForm })));
const CaseList = React.lazy(() => import('../modules/cases/pages/CaseList').then(module => ({ default: module.CaseList })));
const CaseForm = React.lazy(() => import('../modules/cases/pages/CaseForm').then(module => ({ default: module.CaseForm })));
const CaseDetails = React.lazy(() => import('../modules/cases/pages/CaseDetails').then(module => ({ default: module.CaseDetails })));
const DocumentList = React.lazy(() => import('../modules/documents/pages/DocumentList').then(module => ({ default: module.DocumentList })));
const DocumentUpload = React.lazy(() => import('../modules/documents/pages/DocumentUpload').then(module => ({ default: module.DocumentUpload })));
const OfficialLetters = React.lazy(() => import('../modules/documents/pages/OfficialLetters').then(module => ({ default: module.OfficialLetters })));
const OverindebtednessList = React.lazy(() => import('../modules/overindebtedness/pages/OverindebtednessList').then(module => ({ default: module.OverindebtednessList })));
const OverindebtednessWizard = React.lazy(() => import('../modules/overindebtedness/pages/OverindebtednessWizard').then(module => ({ default: module.OverindebtednessWizard })));
const PriceResearchList = React.lazy(() => import('../modules/price-research/pages/PriceResearchList').then(module => ({ default: module.PriceResearchList })));
const MarketReports = React.lazy(() => import('../modules/price-research/pages/MarketReports').then(module => ({ default: module.MarketReports })));
const ConsumerComplaint = React.lazy(() => import('../modules/public/ConsumerComplaint').then(module => ({ default: module.ConsumerComplaint })));
const PublicServiceForm = React.lazy(() => import('../modules/public/PublicServiceForm').then(module => ({ default: module.PublicServiceForm })));
const CitizenDashboard = React.lazy(() => import('../modules/citizen/CitizenDashboard').then(module => ({ default: module.CitizenDashboard })));
const InspectionList = React.lazy(() => import('../modules/inspections/pages/InspectionList').then(module => ({ default: module.InspectionList })));
const HearingList = React.lazy(() => import('../modules/hearings/pages/HearingList').then(module => ({ default: module.HearingList })));
const HearingForm = React.lazy(() => import('../modules/hearings/pages/HearingForm').then(module => ({ default: module.HearingForm })));
const ReportList = React.lazy(() => import('../modules/reports/pages/ReportList').then(module => ({ default: module.ReportList })));
const Analytics = React.lazy(() => import('../modules/analytics/pages/Analytics').then(module => ({ default: module.Analytics })));
const UserList = React.lazy(() => import('../modules/users/pages/UserList').then(module => ({ default: module.UserList })));
const Settings = React.lazy(() => import('../modules/settings/pages/Settings').then(module => ({ default: module.Settings })));
const LegalOpinions = React.lazy(() => import('../modules/legal/pages/LegalOpinions').then(module => ({ default: module.LegalOpinions })));

// New Modules (Excellence Level)
const QueuePanel = React.lazy(() => import('../modules/attendance/pages/QueuePanel').then(module => ({ default: module.QueuePanel })));
const TicketKiosk = React.lazy(() => import('../modules/attendance/pages/TicketKiosk').then(module => ({ default: module.TicketKiosk })));
const VirtualHearing = React.lazy(() => import('../modules/hearings/pages/VirtualHearing').then(module => ({ default: module.VirtualHearing })));
const InspectionMobile = React.lazy(() => import('../modules/inspections/pages/InspectionMobile').then(module => ({ default: module.InspectionMobile })));
const Ombudsman = React.lazy(() => import('../modules/public/Ombudsman').then(module => ({ default: module.Ombudsman })));

// Loading Component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal/consumer" element={<ConsumerComplaint />} />
        <Route path="/portal/ombudsman" element={<Ombudsman />} />
        <Route path="/portal/:type" element={<PublicServiceForm />} />
        
        {/* Public Attendance Routes (TV & Kiosk) */}
        <Route path="/queue/panel" element={<QueuePanel />} />
        <Route path="/queue/kiosk" element={<TicketKiosk />} />

        {/* Protected Citizen Routes */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Protected Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Consumers */}
          <Route path="/consumers" element={<ConsumerList />} />
          <Route path="/consumers/new" element={<ConsumerForm />} />
          <Route path="/consumers/:id/edit" element={<ConsumerForm />} />
          
          {/* Suppliers */}
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
          
          {/* Cases */}
          <Route path="/cases" element={<CaseList />} />
          <Route path="/cases/new" element={<CaseForm />} />
          <Route path="/cases/:id" element={<CaseDetails />} />
          
          {/* Documents */}
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/upload" element={<DocumentUpload />} />
          <Route path="/documents/letters" element={<OfficialLetters />} />
          
          {/* Overindebtedness */}
          <Route path="/overindebtedness" element={<OverindebtednessList />} />
          <Route path="/overindebtedness/new" element={<OverindebtednessWizard />} />
          <Route path="/overindebtedness/negotiation" element={<OverindebtednessWizard />} />
          <Route path="/overindebtedness/:id" element={<OverindebtednessWizard />} />

          {/* Price Research */}
          <Route path="/price-research" element={<PriceResearchList />} />
          <Route path="/price-research/reports" element={<MarketReports />} />

          {/* Inspections */}
          <Route path="/inspections" element={<InspectionList />} />
          <Route path="/inspections/mobile" element={<InspectionMobile />} />

          {/* Hearings */}
          <Route path="/hearings" element={<HearingList />} />
          <Route path="/hearings/new" element={<HearingForm />} />
          <Route path="/hearings/live/:id" element={<VirtualHearing />} />

          {/* Legal */}
          <Route path="/legal-opinions" element={<LegalOpinions />} />

          {/* Reports & Analytics */}
          <Route path="/reports" element={<ReportList />} />
          <Route path="/analytics" element={<Analytics />} />
          
          {/* System */}
          <Route path="/users" element={<UserList />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
