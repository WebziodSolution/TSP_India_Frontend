import React from 'react';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import Components from '../../muiComponents/components';

function GlobalAlert({ alert, setAlert }) {

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ open: false, message: '', type: '' })
  };
  
  return (
    <div>
      <Components.Snackbar Snackbar open={alert.open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Components.Alert
          onClose={handleClose}
          severity={alert.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Components.Alert>
      </Components.Snackbar>
    </div>
  );
}

const mapStateToProps = (state) => ({
  alert: state.common.alert,
});

const mapDispatchToProps = {
  setAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalAlert);