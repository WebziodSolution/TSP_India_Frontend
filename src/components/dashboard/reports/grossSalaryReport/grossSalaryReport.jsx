import React, { useEffect, useState } from 'react'
import { getAllStatementMasters } from '../../../../service/statementMaster/StatementMaster'
import DataTable from '../../../common/table/table';


const filterOptions = [
    { id: 1, title: 'January', value: 1 },
    { id: 2, title: 'February', value: 2 },
    { id: 3, title: 'March', value: 3 },
    { id: 4, title: 'April', value: 4 },
    { id: 5, title: 'May', value: 5 },
    { id: 6, title: 'June', value: 6 },
    { id: 7, title: 'July', value: 7 },
    { id: 8, title: 'August', value: 8 },
    { id: 9, title: 'September', value: 9 },
    { id: 10, title: 'October', value: 10 },
    { id: 11, title: 'November', value: 11 },
    { id: 12, title: 'December', value: 12 }
];

const GrossSalaryReport = () => {

    const [data, setData] = useState([])
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    const handleFetchData = async () => {
        if (userInfo?.companyId) {
            const result = await getAllStatementMasters(userInfo.companyId)
            if (result?.data?.status === 200) {
                let data = result.data.result?.map((item, index) => ({
                    ...item,
                    rowId: index + 1
                })) || [];
                if (data.length > 0) {
                    const totalPF = data.reduce((sum, emp) => sum + (Number(emp.totalPf) || 0), 0);
                    const totalPT = data.reduce((sum, emp) => sum + (Number(emp.totalPt) || 0), 0);
                    const totalNetSalary = data.reduce((sum, emp) => sum + (Number(emp.totalSalary) || 0), 0);
                    data.push({
                        rowId: 'Total',
                        totalPf: totalPF,
                        totalPt: totalPT,
                        totalSalary: totalNetSalary,
                        isTotalRow: true
                    });
                }
                setData(data)
            }
        }
    }

    useEffect(() => {
        document.title = "Gross Salary Report - Calculate Salary";
        handleFetchData()
    }, [])

    const columns = [
        {
            field: 'rowId', headerName: '#', headerClassName: 'uppercase', flex: 1, maxWidth: 100,
            renderCell: (params) =>
                params.row.isTotalRow ? null : <span>{params.value}</span>
        },
        {
            field: 'month',
            headerName: 'Month',
            headerClassName: 'uppercase',
            sortable: false,
            flex: 1,
            maxWidth: 300,
            renderCell: (params) =>
                params.row.isTotalRow
                    ? <strong className='font-semibold'>Total</strong>
                    : `${filterOptions?.find(option => option.value === params.value)?.title}-${params.row.year}`
        },
        {
            field: 'totalPf',
            headerName: 'Total PF',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 250,
            align: "right",
            sortable: false,
            headerAlign: "right",
            renderCell: (params) => params.row.isTotalRow ? <strong className='font-semibold'>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong> : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        },
        {
            field: 'totalPt',
            headerName: 'Total PT',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
            align: "right",
            sortable: false,
            headerAlign: "right",
            renderCell: (params) => params.row.isTotalRow ? <strong className='font-semibold'>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong> : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        },
        {
            field: 'totalSalary',
            headerName: 'Total Net Salary',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 300,
            align: "right",
            headerAlign: "right",
            sortable: false,
            renderCell: (params) =>
                params.row.isTotalRow
                    ? <strong className='font-semibold'>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                    : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        }
    ];

    const getRowId = (row) => row.rowId ?? row.id;

    return (
        <div className='px-3 lg:px-0'>
            <div className='border rounded-lg bg-white lg:w-full h-[550px]'>
                <DataTable
                    columns={columns}
                    rows={data}
                    getRowId={getRowId}
                    height={550}
                />
                {/* <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="border border-black bg-gray-100">
                            <th className="border border-black py-3 px-4 text-left text-sm font-bold text-gray-700 capitalize align-middle">#</th>
                            <th className="border border-black py-3 px-4 text-left text-sm font-bold text-gray-700 capitalize align-middle">Month</th>
                            <th className="border border-black py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Total PF</th>
                            <th className="border border-black py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Total PT</th>
                            <th className="border border-black py-3 px-4 text-right text-sm font-bold text-gray-700 capitalize align-middle">Net Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item, index) => (
                            <tr key={index} className="border border-black">
                                <td className="border border-black text-left text-sm py-4 px-4 align-middle">{index + 1}</td>
                                <td className="border border-black text-left text-sm py-4 px-4 align-middle">{`${filterOptions?.find(option => option.value === item?.month)?.title}-${item?.year}`}</td>
                                <td className="border border-black text-right text-sm py-4 px-4 align-middle">₹{item?.totalPf?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                <td className="border border-black text-right text-sm py-4 px-4 align-middle">₹{item?.totalPt?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                                <td className="border border-black text-right text-sm py-4 px-4 align-middle">₹{item?.totalSalary?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</td>
                            </tr>
                        ))}
                        <tr className="font-bold border border-black">
                            <td colSpan={2} className="border border-black py-3 px-4 text-right text-sm capitalize align-middle">
                                <strong className='font-bold mr-5'>Total</strong>
                            </td>
                            <td className="border border-black py-3 px-4 text-right text-sm capitalize align-middle text-gray-800">
                                <strong className='font-bold'>₹{data?.reduce((acc, item) => acc + (item?.totalPf || 0), 0)?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                            </td>
                            <td className="border border-black py-3 px-4 text-right text-sm capitalize align-middle text-gray-800">
                                <strong className='text-gray-600'>₹{data?.reduce((acc, item) => acc + (item?.totalPt || 0), 0)?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                            </td>
                            <td className="border border-black py-3 px-4 text-right text-sm capitalize align-middle text-gray-800">
                                <strong className='text-gray-600'>₹{data?.reduce((acc, item) => acc + (item?.totalSalary || 0), 0)?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table> */}
            </div>
        </div>
    )
}

export default GrossSalaryReport