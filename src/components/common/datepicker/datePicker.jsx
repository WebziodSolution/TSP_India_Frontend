import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    default_color,
    default_hover_color,
    error_color,
    primary_color,
} from '../../../utils/cssVariables/variable';
import Components from '../../muiComponents/components';

const BaseDatePicker = React.forwardRef(({
    label,
    placeholder,
    type,
    error,
    helperText,
    value,
    onChange,
    endIcon,
}, ref) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker            
                    label={label || 'Basic date picker'}
                    value={value}
                    onChange={onChange}
                    ref={ref}                    
                    renderInput={(params) => (
                        <Components.TextField
                            {...params}
                            placeholder={placeholder}
                            helperText={helperText}
                            error={error}
                            InputProps={{
                                endAdornment: endIcon,
                                ...params.InputProps,
                            }}
                        />
                    )}
                    sx={{
                        '& .MuiStack-root': {
                            padding: 0
                        },
                        '& .MuiOutlinedInput-root': {
                            height: '2.2rem',  // Smaller height
                            borderRadius: '0.5rem',
                            height: '3rem',
                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '& fieldset': {
                                borderColor: error ? error_color : default_color, // Error color logic
                            },
                            '&:hover fieldset': {
                                borderColor: error ? error_color : default_hover_color, // Hover border color
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: error ? error_color : primary_color, // Focus border color
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: error ? error_color : default_color, // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: error ? error_color : primary_color, // Focused label color
                        },
                        '& .MuiInputBase-input': {
                            color: '#3b4056', // Text color
                        },
                        '& .Mui-disabled': {
                            color: '#3b4056', // Disabled text color
                        },
                        '& .MuiFormHelperText-root': {
                            color: error_color,
                            fontSize: '14px',
                            fontWeight: '500',
                            marginX: 0.5,
                        },
                        fontFamily:
                            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                    }}
                />
            </DemoContainer>
        </LocalizationProvider>
    );
});

export default BaseDatePicker;
