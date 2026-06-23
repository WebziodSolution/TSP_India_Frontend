import React from "react";
import { LocalizationProvider, StaticTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller } from "react-hook-form";
import { useTheme } from '@mui/material';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";

const DateTimePickerComponent = ({ name, setValue, control, label, minTime, maxTime}) => {
    const theme = useTheme();

    const customTheme = createTheme({
        components: {
            MuiClock: {
                styleOverrides: {
                    root: {
                        color: "#000000",
                    },
                },
            },
            MuiPickersLayout: {
                styleOverrides: {
                    root: {
                        backgroundColor: "#fff",
                        borderRadius: "0.5rem",
                    },
                },
            },
            MuiTypography: {
                styleOverrides: {
                    root: {
                        color: "#000000",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: theme.palette.primary.main,
                    },
                },
            },
        },
    });
    return (
        <ThemeProvider theme={customTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                    name={name}
                    control={control}
                    render={({ field, fieldState }) => (
                        <Box sx={{ mt: 1 }}>
                            <StaticTimePicker
                                orientation="landscape"
                                displayStaticWrapperAs="desktop"
                                value={field.value ? dayjs(field.value) : dayjs()}
                                onChange={(newValue) => {
                                    setValue(name, newValue);
                                    field.onChange(newValue);
                                }}
                                minTime={minTime ? dayjs(minTime) : undefined}
                                maxTime={maxTime ? dayjs(maxTime) : undefined}
                                sx={{
                                    '& .MuiClock-pin': {
                                        background: theme.palette.primary.main
                                    },
                                    '& .MuiClockPointer-root': {
                                        background: theme.palette.primary.main
                                    },
                                    '& .MuiClockPointer-thumb': {
                                        background: theme.palette.primary.main,
                                        border: `16px solid ${theme.palette.primary.main}`
                                    },
                                    '& .MuiClock-amButton.Mui-selected': {
                                        background: theme.palette.primary.main,
                                        color: theme.palette.primary.text.main,
                                    },
                                    '& .MuiClock-pmButton.Mui-selected': {
                                        background: theme.palette.primary.main,
                                        color: theme.palette.primary.text.main,
                                    },
                                    '& .MuiPickersArrowSwitcher-previousIconButton': {
                                        color: theme.palette.primary.main,
                                    },
                                    '& .MuiPickersArrowSwitcher-nextIconButton ': {
                                        color: theme.palette.primary.main,
                                    },
                                    '& .Mui-disabled': {
                                        color: "#F5F5F7",
                                    }
                                }}
                            />                        
                        </Box>
                    )}
                />
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default DateTimePickerComponent;
