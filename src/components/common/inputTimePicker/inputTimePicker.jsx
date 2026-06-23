import { Controller } from 'react-hook-form';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material';

const InputTimePicker = ({ name, control, label, rules, disabled, minTime, maxTime }) => {
  const theme = useTheme();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <TimePicker
            {...field}
            label={label}
            disabled={disabled}
            minTime={minTime}
            maxTime={maxTime}
            closeOnSelect={false}   // 👈 ADD THIS
            slotProps={{
              textField: {
                error: !!error,
                InputLabelProps: { shrink: true },
              },
            }}
            sx={{
              '& .MuiInputBase-root': {
                color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
              },
              '& .MuiInputBase-input': {
                color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                padding: '8.5px 14px',
              },
              '& .MuiOutlinedInput-root:hover': {
                color: error ? theme.palette.error.main : theme.palette.primary.text.main,
                borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
              },
              // '& .MuiFormLabel-root':{
              //   transform: `translate(14px, 9px) scale(1)`
              // },
              // '& .MuiFormLabel-root:focus':{
              //   transform: `translate(14px, -10px) scale(1)`
              // }
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default InputTimePicker;