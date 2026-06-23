import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import Input from '../input/input';
import { useTheme } from '@mui/material';
import CustomIcons from '../icons/CustomIcons';
import { useMemo } from 'react';

const paginationModel = { page: 0, pageSize: 50 };

const CustomNoRowsOverlay = () => {
    return (
        <GridOverlay style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ color: '#6d6d6d', fontSize: '15px' }}>No rows</div>
        </GridOverlay>
    );
};

export default function DataTable({
    checkboxSelection = false,
    showSearch = false,
    showButtons = false,
    buttonText = "",
    buttonAction = () => { },
    rows,
    columns,
    getRowId,
    height,
    permissions,
    buttons,
    footerRowData,
    footerRowClassName
}) {
    const theme = useTheme();

    // Prepare rows for DataGrid: add the footer row with a flag
    const dataGridRows = useMemo(() => {
        if (rows?.length > 0 && footerRowData) {
            // Add isTotalRow flag to the footer row
            const footerRow = { ...footerRowData, isTotalRow: true };
            return [...rows, footerRow];
        }
        return rows || [];
    }, [rows, footerRowData]);

    // Apply class names to the total row
    const getRowClassName = (params) => {
        if (params.row.isTotalRow) {
            // Combine the default footer class with the custom one
            return `MuiDataGrid-footer-row ${footerRowClassName || ''}`.trim();
        }
        return '';
    };

    // Modify columns to handle rendering for the total row
    const dataGridColumns = useMemo(() => {
        return columns.map(col => {
            // For the employeeName column, show a bold label in the total row
            if (col.field === 'employeeName' && col.headerName !== '#') {
                return {
                    ...col,
                    renderCell: (params) => {
                        if (params.row.isTotalRow) {
                            return (
                                <span style={{ fontWeight: 'bold' }}>
                                    {params.row.employeeName}
                                </span>
                            );
                        }
                        return col.renderCell ? col.renderCell(params) : params.value;
                    },
                };
            }
            // For financial columns, handle total row specially
            if (['basicSalary', 'otAmount', 'pfAmount', 'ptAmount', 'totalEarnings', 'otherDeductions', 'totalDeductions', 'netSalary'].includes(col.field)) {
                return {
                    ...col,
                    renderCell: (params) => {
                        if (params.row.isTotalRow) {
                            if (['otherDeductions', 'totalEarnings', 'totalDeductions', 'netSalary'].includes(col.field)) {
                                return <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>;
                            }
                            return <span></span>; // empty for other columns in total row
                        }
                        return col.renderCell ? col.renderCell(params) : params.value;
                    },
                };
            }
            return col;
        });
    }, [columns]);

    return (
        <>
            {(showSearch || showButtons) && (
                <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none grid md:grid-cols-2">
                    <div className="w-full md:w-60 mb-3 md:mb-0 md:max-w-xs">
                        {showSearch && (
                            <Input
                                name="search"
                                label="Search"
                                endIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />}
                            />
                        )}
                    </div>
                    <div className="w-full flex justify-end md:justify-end items-center gap-3">
                        {showButtons && buttons()}
                    </div>
                </div>
            )}

            <DataGrid
                rows={dataGridRows}
                columns={dataGridColumns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[50, 75, 100]}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                getRowId={getRowId}
                checkboxSelection={checkboxSelection}
                getRowClassName={getRowClassName}
                slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                }}
                sx={{
                    height: height || 550,
                    maxHeight: height || 550,
                    color: theme.palette.primary.text.main,
                    overflow: 'auto',
                    '& .MuiDataGrid-columnHeaders': {
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        backgroundColor: theme.palette.primary.background,
                    },
                    '& .MuiDataGrid-footerContainer': {
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 2,
                        backgroundColor: theme.palette.background.paper,
                    },
                    '& .MuiDataGrid-container--top [role="row"], .MuiDataGrid-container--bottom [role="row"]': {
                        backgroundColor: theme.palette.background.default,
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: theme.palette.background.default,
                    },
                    '& .MuiDataGrid-footer-row': {
                        fontWeight: 'bold',
                        backgroundColor: theme.palette.grey[100],
                        borderTop: `2px solid ${theme.palette.grey[300]}`,
                        '& .MuiDataGrid-cell[data-field="totalEarnings"], & .MuiDataGrid-cell[data-field="totalDeductions"], & .MuiDataGrid-cell[data-field="netSalary"]': {
                            textAlign: 'right',
                        },
                        '& .MuiDataGrid-cell[data-field="employeeName"]': {
                            textAlign: 'left',
                            paddingLeft: '16px'
                        },
                        '& .MuiDataGrid-cell[data-field="rowId"]': {
                            textAlign: 'left',
                            paddingLeft: '16px'
                        },
                    },
                }}
            />
        </>
    );
}