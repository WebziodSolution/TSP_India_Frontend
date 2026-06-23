// import React from 'react';
// import Components from '../../muiComponents/components';
// import { useTheme } from '@mui/material';

// export default function Stapper({ steps, activeStep, orientation, labelFontSize, width = null }) {
//     const theme = useTheme();

//     return (
//         <>
//             <Components.Box sx={{ width: width !== null ? width : 'full' }}>
//                 <Components.Stepper activeStep={activeStep} orientation={orientation} alternativeLabel={orientation === "horizontal" ? true : false}>
//                     {steps?.map((label, index) => (
//                         <Components.Step key={index}>
//                             <Components.StepLabel
//                                 sx={{
//                                     '& .MuiStepLabel-label': {
//                                         color: theme.palette.text.main,
//                                         fontSize: labelFontSize,
//                                         textTransform: 'capitalize'
//                                     },
//                                     '& .MuiStepLabel-label.Mui-disabled.MuiStepLabel-alternativeLabel': {
//                                         color: theme.palette.text.disabled,
//                                     },
//                                     '& .MuiStepLabel-label.Mui-active': {
//                                         color: theme.palette.primary.main,
//                                     },
//                                     '& .MuiStepLabel-label.Mui-completed': {
//                                         color: theme.palette.primary.main,
//                                     },
//                                     '& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root': {
//                                         color: theme.palette.text.main,                                        
//                                     },
//                                     '& .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium.MuiStepIcon-root.Mui-completed': {
//                                         color: theme.palette.primary.main
//                                     }
//                                 }}
//                             >
//                                 {label}
//                             </Components.StepLabel>
//                         </Components.Step>
//                     ))}
//                 </Components.Stepper>
//             </Components.Box>
//         </>
//     );
// }


import React from 'react';
import { StepConnector, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomIcons from '../icons/CustomIcons';
import Components from '../../muiComponents/components';


export default function Stapper({ steps, activeStep, orientation = "vertical", labelFontSize, width = null }) {
  const theme = useTheme();

  const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: ownerState.completed ? theme.palette.primary.main : '', // Light blue for upcoming steps
    zIndex: 1,
    color: '#fff',
    width: 24,
    height: 24,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: ownerState.active ? 6 : 4,
    borderColor: ownerState.completed ? theme.palette.primary.main : ownerState.active ? theme.palette.primary.main : '#E0E7FF',
  }));

  function CustomStepIcon(props) {
    const { active, completed, className } = props;

    return (
      <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
        {completed ? (
          <CustomIcons iconName="fa-solid fa-check" css="cursor-pointer text-xs" />
        ) : null}
      </CustomStepIconRoot>
    );
  }

  const CustomConnector = styled(StepConnector)(({ theme }) => ({
    [`&.MuiStepConnector-root`]: {
      marginLeft: orientation !== "horizontal" ? 11 : 0,
    },
    [`& .MuiStepConnector-line`]: {
      borderWidth: orientation !== "horizontal" ? 0 : 3,
      borderLeftWidth: orientation !== "horizontal" ? 3 : 0,
      minHeight: orientation !== "horizontal" ? 24 : 5,
      transition: 'border-color 0.3s ease',
      borderColor: '#E0E7FF',
    },
    // When the step is active
    [`&.Mui-active .MuiStepConnector-line`]: {
      borderColor: theme.palette.primary.main,
    },
    // When the step is completed
    [`&.Mui-completed .MuiStepConnector-line`]: {
      borderColor: theme.palette.primary.main,
    },
  }));


  return (
    <Components.Box sx={{ width: width !== null ? width : '100%' }}>
      <Components.Stepper
        activeStep={activeStep}
        orientation={orientation}
        connector={<CustomConnector />}
      >
        {steps?.map((label, index) => (
          <Components.Step key={index}>
            <Components.StepLabel
              StepIconComponent={CustomStepIcon}
              sx={{
                '& .MuiStepLabel-label': {
                  color: activeStep >= index
                    ? theme.palette.primary.text.main
                    : theme.palette.text.disabled,
                  fontSize: labelFontSize || '0.875rem',
                  textTransform: 'capitalize',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                },
              }}
            >
              {label}
            </Components.StepLabel>
          </Components.Step>
        ))}
      </Components.Stepper>
    </Components.Box>
  );
}
