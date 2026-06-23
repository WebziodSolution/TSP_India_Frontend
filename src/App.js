import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import Login from "./components/auth/login/login";
import ForgotPassword from './components/auth/forgotpassword/forgotPassword'
import Dashboard from "./components/dashboard/dashboard";
import PageNotFound from "./components/pageNotFound/pageNotFound";
import TimeCard from "./components/dashboard/timeCard/timeCard";
import AddUser from "./components/dashboard/peoples/addUser/addUser";

import Loading from "./components/loading/loading";
import GlobalAlert from "./components/common/alert/globalAlert";
import Functionality from "./components/dashboard/permissions/functionality/functionality";
import Modules from "./components/dashboard/permissions/modules/modules";
import Roles from "./components/dashboard/permissions/roles/roles";
import AddRoles from "./components/dashboard/permissions/roles/addRoles";
import Department from "./components/dashboard/permissions/department/department";
import Contractor from "./components/dashboard/permissions/contractor/contractor";
import ResetPassword from "./components/auth/forgotpassword/resetPassword";
import UserProfile from "./components/dashboard/settings/userProfile/userProfile";
import Location from "./components/dashboard/locations/location";
import CompanyDetails from "./components/dashboard/company/companyDetails";
import AddCompany from "./components/dashboard/company/addCompany";
import DashboardComponent from "./components/dashboard/dashboardComponent";
import ManageEmployees from "./components/dashboard/company/employee/manageEmployees";
import AddEmployeeComponent from "./components/dashboard/company/employee/addEmployeeComponent";
import MuiThemeProvider from './components/common/muiTheme/muiTheme'
import CompanyTheme from "./components/dashboard/settings/companyTheme/companyTheme";
import ManageShift from "./components/dashboard/companyShift/manageShift";
import DetailedPDFTable from "./components/dashboard/timeCard/timeCardPDF/detailedPDFTable";
import PFReport from "./components/dashboard/reports/PFReport";
import PTReport from "./components/dashboard/reports/PTReport";
import AutomationRules from "./components/dashboard/settings/automationrRules/automationRules";
import OvertimeRules from "./components/dashboard/settings/automationrRules/overtimeRules/overtimeRules";
import GenerateSalary from "./components/dashboard/reports/salaryReport/generateSalary";
import SalaryReport from "./components/dashboard/reports/salaryReport/salaryReport";
import GrossSalaryReport from "./components/dashboard/reports/grossSalaryReport/grossSalaryReport";
import WeekOffTemplates from "./components/dashboard/settings/automationrRules/weekOffTemplates/weekOffTemplates";
import AddWeekOfTemplates from "./components/dashboard/settings/automationrRules/weekOffTemplates/addWeekOfTemplates";
import AddLateEntryTemplates from "./components/dashboard/settings/automationrRules/addLateEntryTemplates/addLateEntryTemplates";
import AddEarlyExitTemplates from "./components/dashboard/settings/automationrRules/addEarlyExitTemplates/addEarlyExitTemplates";
import HolidaysTemplates from "./components/dashboard/settings/automationrRules/holidaysTemplates/holidaysTemplates";
import AddHolidaysTemplates from "./components/dashboard/settings/automationrRules/holidaysTemplates/addHolidaysTemplates";
import FaceRegistrationPage from "./pages/faceRegistrationPage";
import AutoClockIn from "./components/dashboard/settings/automationrRules/autoClockIn/autoClockIn";

library.add(fas, far)

function App() {

  const router = createBrowserRouter([
    {
      path: "*",
      element: <PageNotFound />,
    },
    {
      path: "/faceRegistrationPage",
      element: <FaceRegistrationPage />,
    },
    {
      path: "/",
      element: <Navigate to="/signin" replace />,
    },
    {
      path: "/signin",
      element: <Login />,
    },
    {
      path: "/reset-pin/:token",
      element: <ResetPassword />,
    },
    {
      path: "/forgotpin",
      element: <ForgotPassword />,
    },
    {
      path: "/detailedPdf",
      element: <DetailedPDFTable />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
      children: [
        {
          path: "main",
          element: <DashboardComponent />,
        },
        {
          path: "timecard",
          element: <TimeCard />,
        },
        {
          path: "manageuser",
          element: <AddUser />,
        },
        {
          path: "managelocation",
          element: <Location />,
        },
        {
          path: "manageemployees",
          element: <ManageEmployees />,
        },
        {
          path: "manageemployees/add/:companyId",
          element: <AddEmployeeComponent />,
        },
        {
          path: "manageemployees/update/:companyId/:id",
          element: <AddEmployeeComponent />,
        },
        {
          path: "managecompany",
          element: <CompanyDetails />,
        },
        {
          path: "addcompany",
          element: <AddCompany />,
        },
        {
          path: "editcompany/:id",
          element: <AddCompany />,
        },
        {
          path: "functionality",
          element: <Functionality />,
        },
        {
          path: "module",
          element: <Modules />,
        },
        {
          path: "manageroles",
          element: <Roles />,
        },
        {
          path: "manageroles/addrole",
          element: <AddRoles />,
        },
        {
          path: "manageroles/updaterole/:id",
          element: <AddRoles />,
        },
        {
          path: "managedepartments",
          element: <Department />,
        },
        {
          path: "contractor",
          element: <Contractor />,
        },
        {
          path: "profile",
          element: <UserProfile />,
        },
        {
          path: "companyTheme",
          element: <CompanyTheme />,
        },
        {
          path: "manageShifts",
          element: <ManageShift />,
        },
        {
          path: "pfreport",
          element: <PFReport />,
        },
        {
          path: "ptreport",
          element: <PTReport />,
        },
        {
          path: "generatesalary",
          element: <GenerateSalary />,
        },
        {
          path: "salaryreport",
          element: <SalaryReport />,
        },
        {
          path: "grosssalaryreport",
          element: <GrossSalaryReport />,
        },
        {
          path: "automationrules",
          element: <AutomationRules />,
        },
        {
          path: "automationrules/overtimerules",
          element: <OvertimeRules />,
        },
        {
          path: "automationrules/week-off/templates",
          element: <WeekOffTemplates />,
        },
        {
          path: "automationrules/week-off/add",
          element: <AddWeekOfTemplates />,
        },
        {
          path: "automationrules/week-off/edit/:id",
          element: <AddWeekOfTemplates />,
        },
        {
          path: "automationrules/late-entry",
          element: <AddLateEntryTemplates />,
        },
        {
          path: "automationrules/early-exit",
          element: <AddEarlyExitTemplates />,
        },
        {
          path: "automationrules/holidays/templates",
          element: <HolidaysTemplates />,
        },
        {
          path: "automationrules/holidays-templates/add",
          element: <AddHolidaysTemplates />,
        },
        {
          path: "automationrules/holidays-templates/edit/:id",
          element: <AddHolidaysTemplates />,
        },
        {
          path: "automationrules/auto-clockin",
          element: <AutoClockIn />,
        },
      ]
    },
  ])

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <>
      <MuiThemeProvider>
        <div className="h-screen">
          <Loading />
          <GlobalAlert />
          <RouterProvider router={router} />
        </div>
      </MuiThemeProvider>
    </>
  );
}

export default App;