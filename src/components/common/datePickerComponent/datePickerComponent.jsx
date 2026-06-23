import React from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Controller } from "react-hook-form";
import { useTheme } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

dayjs.extend(customParseFormat);

const DISPLAY_FORMAT = "DD/MM/YYYY";

const API_DATETIME_FORMATS = [
  "DD/MM/YYYY, hh:mm:ss A", // your existing
  "MM/DD/YYYY, hh:mm:ss A"  // new one
];

const API_DATE_FORMATS = [
  "DD/MM/YYYY",
  "MM/DD/YYYY"
];


const DatePickerComponent = ({
  name,
  setValue,
  control,
  label,
  minDate,
  maxDate,
  required = false
}) => {
  const theme = useTheme();

  const customTheme = createTheme({
    components: {
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: { color: "#000000" }
        }
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            color: "#000000",
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "#ffffff"
            },
            "&.Mui-selected": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "#ffffff !important"
            }
          }
        }
      },
      MuiPaper: { styleOverrides: { root: { color: "#000000" } } },
      MuiIconButton: { styleOverrides: { root: { color: theme.palette.primary.main } } },
      MuiPickersCalendarHeader: { styleOverrides: { root: { color: "#000000" } } },
      MuiTypography: { styleOverrides: { root: { color: "#000000" } } }
    }
  });

  const toDayjs = (val) => {
    if (!val) return null;

    // Dayjs already
    if (dayjs.isDayjs(val)) return val;

    // Date object
    if (val instanceof Date) {
      const d = dayjs(val);
      return d.isValid() ? d : null;
    }

    // String
    if (typeof val === "string") {
      const s = val.trim();

      // If has time part (comma) -> try both datetime formats
      if (s.includes(",")) {
        const d = dayjs(s, API_DATETIME_FORMATS, true); // ✅ strict with multiple formats
        return d.isValid() ? d : null;
      }

      // Date only -> try both date formats
      const d = dayjs(s, API_DATE_FORMATS, true);
      return d.isValid() ? d : null;
    }

    // Fallback
    const d = dayjs(val);
    return d.isValid() ? d : null;
  };


  return (
    <ThemeProvider theme={customTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          rules={{ required }}
          render={({ field, fieldState }) => {
            const parsedValue = toDayjs(field.value) ?? dayjs();

            return (
              <DatePicker
                label={label}
                format={DISPLAY_FORMAT} // ✅ display as DD/MM/YYYY
                value={parsedValue}
                onChange={(date) => {
                  // ✅ store in DD/MM/YYYY (no time)
                  const formatted = date ? dayjs(date).format(DISPLAY_FORMAT) : null;
                  field.onChange(formatted);
                  setValue(name, formatted);
                }}
                minDate={minDate ? toDayjs(minDate) : null}
                maxDate={maxDate ? toDayjs(maxDate) : dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    error: !!fieldState.error,
                    placeholder: "DD/MM/YYYY",
                    // helperText: fieldState.error ? "This field is required" : null,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                        "& fieldset": {
                          borderColor: fieldState.error
                            ? theme.palette.error.main
                            : theme.palette.primary.main
                        },
                        "&:hover fieldset": {
                          borderColor: fieldState.error
                            ? theme.palette.error.dark
                            : theme.palette.primary.main
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: fieldState.error
                            ? theme.palette.error.main
                            : theme.palette.primary.main
                        }
                      },
                      "& .MuiInputLabel-root": {
                        color: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.primary.text.main
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: fieldState.error
                          ? theme.palette.error.main
                          : theme.palette.primary.text.main
                      },
                      "& .MuiInputBase-input": {
                        color: theme.palette.primary.text.main,
                        height: 7
                      },
                      "& .Mui-disabled": {
                        color: theme.palette.primary.text.main
                      },
                      "& .MuiFormHelperText-root": {
                        color: theme.palette.error.main,
                        fontSize: "14px",
                        fontWeight: "500",
                        marginX: 0.5
                      },
                      fontFamily:
                        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
                    }
                  }
                }}
              />
            );
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default DatePickerComponent;



// import React from "react";
// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { Controller } from "react-hook-form";
// import { useTheme } from '@mui/material';
// import { createTheme, ThemeProvider } from "@mui/material/styles";

// const DatePickerComponent = ({ name, setValue, control, label, minDate, maxDate, required = false }) => {
//   const theme = useTheme();

//   const customTheme = createTheme({
//     components: {
//       MuiDayCalendar: {
//         styleOverrides: {
//           weekDayLabel: {
//             color: '#000000',
//           }
//         }
//       },
//       MuiPickersDay: {
//         styleOverrides: {
//           root: {
//             color: "#000000",
//             "&:hover": {
//               backgroundColor: theme.palette.primary.main,
//               color: "#ffffff",
//             },
//             "&.Mui-selected": {
//               backgroundColor: `${theme.palette.primary.main} !important`,
//               color: "#ffffff !important",
//             },
//           },
//         },
//       },
//       MuiPaper: {
//         styleOverrides: {
//           root: {
//             color: "#000000",
//           },
//         },
//       },
//       MuiIconButton: {
//         styleOverrides: {
//           root: {
//             color: theme.palette.primary.main,
//           },
//         },
//       },
//       MuiPickersCalendarHeader: {
//         styleOverrides: {
//           root: {
//             color: "#000000",
//           },
//         },
//       },
//       MuiTypography: {
//         styleOverrides: {
//           root: {
//             color: "#000000",
//           },
//         },
//       },
//     },
//   });

//   return (
//     <ThemeProvider theme={customTheme}>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Controller
//           name={name}
//           control={control}
//           rules={{
//             required: required
//           }}
//           render={({ field, fieldState }) => (
//             <DatePicker
//               {...field}
//               label={label}
//               format="DD/MM/YYYY"
//               value={field.value ? dayjs(field.value) : dayjs(null)}
//               onChange={(date) => {
//                 field.onChange(dayjs(date).format("DD/MM/YYYY"));
//                 setValue(name, date ? dayjs(date).format("DD/MM/YYYY") : null);
//               }}
//               minDate={minDate ? dayjs(minDate) : null}
//               maxDate={maxDate ? dayjs(maxDate) : dayjs(new Date())}
//               //dayjs(new Date())
//               slotProps={{
//                 textField: {
//                   fullWidth: true,
//                   variant: "outlined",
//                   error: !!fieldState.error,
//                   // helperText: fieldState.error ? "This field is required" : null,
//                   sx: {
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: '0.5rem',
//                       transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
//                       '& fieldset': {
//                         borderColor: fieldState.error
//                           ? theme.palette.error.main
//                           : theme.palette.primary.main,
//                       },
//                       '&:hover fieldset': {
//                         borderColor: fieldState.error
//                           ? theme.palette.error.dark
//                           : theme.palette.primary.main,
//                       },
//                       '&.Mui-focused fieldset': {
//                         borderColor: fieldState.error
//                           ? theme.palette.error.main
//                           : theme.palette.primary.main,
//                       },
//                     },
//                     '& .MuiInputLabel-root': {
//                       color: fieldState.error
//                         ? theme.palette.error.main
//                         : theme.palette.primary.text.main,
//                     },
//                     '& .MuiInputLabel-root.Mui-focused': {
//                       color: fieldState.error
//                         ? theme.palette.error.main
//                         : theme.palette.primary.text.main,
//                     },
//                     '& .MuiInputBase-input': {
//                       color: theme.palette.primary.text.main,
//                       height: 7,
//                     },
//                     '& .Mui-disabled': {
//                       color: theme.palette.primary.text.main,
//                     },
//                     '& .MuiFormHelperText-root': {
//                       color: theme.palette.error.main,
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       marginX: 0.5,
//                     },
//                     fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;',
//                   },
//                 },
//               }}
//             />
//           )}
//         />
//       </LocalizationProvider>
//     </ThemeProvider>
//   );
// };

// export default DatePickerComponent;