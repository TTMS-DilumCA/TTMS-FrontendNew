import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Login from './components/common/Login';
import ProtectedRoute from './ProtectedRoute';
import HomeManager from './pages/manager/HomeManager';
import HomeMO_01 from './pages/machineOperator_01/HomeMO_01';
import HomeMO_02 from './pages/machineOperator_02/HomeMO_02';
import MoldDetails from './pages/manager/MoldDetails';
import ProcessDetails from './pages/manager/ProcessDetails';
import Users from './pages/manager/Users';
import ForgotPassword from './components/common/ForgotPassword';
// import ChangePassword from './components/common/ChangePassword';
import VerifyOtp from './components/common/VerifyOtp';
import ResetPassword from './components/common/ResetPassword';
import ProcessManage from './pages/machineOperator_01/ProcessManage';
import ProfileManager from './pages/manager/ProfileManager';
import ProfileMoperator1 from './pages/machineOperator_01/ProfileMoperator1';
import ProfileMoperator2 from './pages/machineOperator_02/ProfileMoperator2';
import ProfileTools from './pages/machineOperator_02/ProfileTools';
import ProfileToolsManager from './pages/manager/ProfileToolsManager';
import BusinessIntelligencePage from './pages/manager/BusinessIntelligencePage';

function App() {
  return (
    <UserProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
        {/* common routes */}
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />
        <Route path= '/forgot-password' element ={<ForgotPassword/>}/>
        {/* <Route path= '/change-password' element ={<ChangePassword/>}/> */}
        <Route path= '/verify-otp' element ={<VerifyOtp/>}/>
        <Route path= '/reset-password' element ={<ResetPassword/>}/>                     
  {/* Manager routes */}
        <Route path='/manager' element={<ProtectedRoute component={HomeManager} role="ROLE_MANAGER" />} />  
        <Route path='/mold-details' element={<ProtectedRoute component={MoldDetails} role="ROLE_MANAGER" />} />
        <Route path='/process-details' element={<ProtectedRoute component={ProcessDetails} role="ROLE_MANAGER" />} />
        <Route path = 'users' element={<ProtectedRoute component = {Users} role ="ROLE_MANAGER"/> }/>
        <Route path='/profile-manager' element={<ProtectedRoute component={ProfileManager} role="ROLE_MANAGER" />} />
        <Route path='/profile-tools-manager' element={<ProtectedRoute component={ProfileToolsManager} role="ROLE_MANAGER" />} />
        <Route path='/business-intelligence' element={<ProtectedRoute component={BusinessIntelligencePage} role="ROLE_MANAGER" />} />

  {/* machineoperator 01  routes */}
        <Route path='/operator1' element={<ProtectedRoute component={HomeMO_01} role="ROLE_MACHINE_OPERATOR_01" />} />
        <Route path='/process-manage' element={<ProtectedRoute component={ProcessManage} role="ROLE_MACHINE_OPERATOR_01" />} />
        <Route path='/profile-operator1' element={<ProtectedRoute component={ProfileMoperator1} role="ROLE_MACHINE_OPERATOR_01" />} />

  {/* machineoperator 02  routes */}
        <Route path='/operator2' element={<ProtectedRoute component={HomeMO_02} role="ROLE_MACHINE_OPERATOR_02" />} />
        <Route path='/profile-operator2' element={<ProtectedRoute component={ProfileMoperator2} role="ROLE_MACHINE_OPERATOR_02" />} />
        <Route path='/profile-tools' element={<ProtectedRoute component={ProfileTools} role="ROLE_MACHINE_OPERATOR_02" />} />

        {/* Redirect to login for any unmatched routes */}
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;