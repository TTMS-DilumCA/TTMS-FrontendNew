import React, { useEffect } from 'react';
import NavBarManager from './pages/manager/NavBarManager';
import NavBarOperator1 from './pages/machineOperator_01/NavBarOperator1';
import NavBarOperator2 from './pages/machineOperator_02/NavBarOperator2';
import Footer from './components/common/Footer';

function RoleBasedLayout({ role, children }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('User token:', token);
  }, []);
  let NavBar;
  switch (role) {
    case 'ROLE_MANAGER':
      NavBar = NavBarManager;
      break;
    case 'ROLE_MACHINE_OPERATOR_01':
      NavBar = NavBarOperator1;
      break;
    case 'ROLE_MACHINE_OPERATOR_02':
      NavBar = NavBarOperator2;
      break;
    default:
      NavBar = null;
      break;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {NavBar && <NavBar />}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px', marginTop: '54px' }}>
        {children}
      </div>
      <Footer style={{ position: 'fixed', bottom: 0, width: '100%' }} />
    </div>
  );
}

export default RoleBasedLayout;