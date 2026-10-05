import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import Input from '../input/input';
import { useTheme } from '@mui/material';
import CustomIcons from '../icons/CustomIcons';
import Button from '../buttons/button';
import { useState, useMemo } from 'react';

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
    const [searchText, setSearchText] = useState('');

    const filterModel = useMemo(() => {
        const tokens = searchText ? searchText.trim().split(/\s+/).filter(Boolean) : [];
        return {
            items: [],
            quickFilterValues: tokens,
        };
    }, [searchText]);

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

    // Modify columns to handle rendering for the total row and quick search
    const dataGridColumns = useMemo(() => {
        return columns.map(col => {
            const enhancedCol = { ...col };

            // Provide search support across cells and row objects for quick filtering
            if (col.getApplyQuickFilterFn === undefined && col.field !== 'action') {
                enhancedCol.getApplyQuickFilterFn = (filterItemValue) => {
                    if (!filterItemValue) return null;
                    const escaped = filterItemValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(escaped, 'i');

                    return (value, row, column, apiRef) => {
                        if (row?.isTotalRow) return true;

                        // 1. Direct cell value check
                        if (value != null && regex.test(String(value))) return true;

                        // 2. Formatted cell value check
                        const formatted = apiRef?.current?.getRowFormattedValue?.(row, column);
                        if (formatted != null && regex.test(String(formatted))) return true;

                        // 3. Custom valueGetter check if column defines one
                        if (typeof column?.valueGetter === 'function') {
                            const val = column.valueGetter(value, row, column, apiRef);
                            if (val != null && regex.test(String(val))) return true;
                        }

                        // 4. Raw field property check
                        if (column?.field && row?.[column.field] != null) {
                            if (regex.test(String(row[column.field]))) return true;
                        }

                        return false;
                    };
                };
            }

            // For the employeeName column, show a bold label in the total row
            if (col.field === 'employeeName' && col.headerName !== '#') {
                enhancedCol.renderCell = (params) => {
                    if (params.row.isTotalRow) {
                        return (
                            <span style={{ fontWeight: 'bold' }}>
                                {params.row.employeeName}
                            </span>
                        );
                    }
                    return col.renderCell ? col.renderCell(params) : params.value;
                };
            }
            // For financial columns, handle total row specially
            if (['basicSalary', 'otAmount', 'pfAmount', 'ptAmount', 'totalEarnings', 'otherDeductions', 'totalDeductions', 'netSalary'].includes(col.field)) {
                enhancedCol.renderCell = (params) => {
                    if (params.row.isTotalRow) {
                        if (['otherDeductions', 'totalEarnings', 'totalDeductions', 'netSalary'].includes(col.field)) {
                            if (col.renderCell) {
                                return col.renderCell(params);
                            }
                            return <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>;
                        }
                        return <span></span>; // empty for other columns in total row
                    }
                    return col.renderCell ? col.renderCell(params) : params.value;
                };
            }
            return enhancedCol;
        });
    }, [columns]);

    return (
        <>
            {(showSearch || showButtons) && (
                <div className="border border-1 py-4 px-5 rounded-lg rounded-b-none flex flex-col md:flex-row justify-between items-center gap-3">
                    {showSearch ? (
                        <div className="w-full md:w-60 md:max-w-xs">
                            <Input
                                name="search"
                                label="Search"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                endIcon={
                                    searchText ? (
                                        <span
                                            onClick={() => setSearchText('')}
                                            className="cursor-pointer text-gray-400 hover:text-gray-600 mr-2 flex items-center"
                                            title="Clear search"
                                        >
                                            <CustomIcons iconName={'fa-solid fa-xmark'} css='h-4 w-4' />
                                        </span>
                                    ) : (
                                        <CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />
                                    )
                                }
                            />
                        </div>
                    ) : null}
                    <div className={`w-full flex ${showSearch ? 'md:w-auto' : 'w-full'} justify-end items-center gap-3 ml-auto`}>
                        {showButtons && (
                            buttons ? (
                                typeof buttons === 'function' ? buttons() : buttons
                            ) : (
                                buttonText ? (
                                    <div className="w-full md:w-auto">
                                        <Button
                                            type="button"
                                            text={buttonText}
                                            onClick={buttonAction}
                                            startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />}
                                        />
                                    </div>
                                ) : null
                            )
                        )}
                    </div>
                </div>
            )}

            <DataGrid
                rows={dataGridRows}
                columns={dataGridColumns}
                filterModel={showSearch ? filterModel : undefined}
                onFilterModelChange={(newModel) => {
                    if (showSearch && newModel?.quickFilterValues) {
                        setSearchText(newModel.quickFilterValues.join(' '));
                    }
                }}
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
                        '& .MuiDataGrid-cell--textRight': {
                            textAlign: 'right',
                            justifyContent: 'flex-end',
                        },
                        '& .MuiDataGrid-cell--textLeft': {
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                        },
                        '& .MuiDataGrid-cell--textCenter': {
                            textAlign: 'center',
                            justifyContent: 'center',
                        },
                        '& .MuiDataGrid-cell[data-field="totalEarnings"], & .MuiDataGrid-cell[data-field="totalDeductions"]': {
                            textAlign: 'right',
                            justifyContent: 'flex-end',
                        },
                        '& .MuiDataGrid-cell[data-field="netSalary"].MuiDataGrid-cell--textLeft': {
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                        },
                        '& .MuiDataGrid-cell[data-field="netSalary"]:not(.MuiDataGrid-cell--textLeft)': {
                            textAlign: 'right',
                            justifyContent: 'flex-end',
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