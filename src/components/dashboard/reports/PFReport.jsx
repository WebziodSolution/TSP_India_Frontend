import { useEffect, useState } from "react";
import { getEmployeePFReport } from "../../../service/companyEmployee/companyEmployeeService";
import DataTable from "../../common/table/table";
import Select from "../../common/select/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Button from "../../common/buttons/button";
import CustomIcons from "../../common/icons/CustomIcons";
import { getCompanyDetails } from "../../../service/companyDetails/companyDetailsService";
import PFPDFTable from "./PdfTable/PFPDFTable";
import { filterOptionsByMonth } from "../../../service/common/commonService";

const PFReport = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [employees, setEmployees] = useState([]);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [showPdfContent, setShowPdfContent] = useState(false);
    const [companyInfo, setCompanyInfo] = useState()
    const [filter, setFilter] = useState(new Date().getMonth());

    const handleGetAllEmployees = async () => {
        setEmployees([]);
        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") {
            userTimeZone = "Asia/Calcutta";
        }
        const params = {
            companyId: userInfo?.companyId,
            type: "PF",
            month: filter,
            userTimeZone: userTimeZone
        }
        const queryString = new URLSearchParams(params).toString();
        const res = await getEmployeePFReport(queryString);
        if (res?.data.status === 200) {

            let data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1
            })) || [];

            // Handle PF
            if (data.length > 0) {
                const totalPF = data.reduce((sum, emp) => sum + (Number(emp.total_amount) || 0), 0);

                data.push({
                    rowId: 'total',
                    userName: 'Total',
                    total_amount: totalPF,
                    isTotalRow: true
                });
            }

            setEmployees(data);
        }
    };

    const handleGetCompanyInfo = async () => {
        if (userInfo?.companyId) {
            const response = await getCompanyDetails(userInfo?.companyId)
            setCompanyInfo(response?.data?.result)
        }
    }

    useEffect(() => {
        handleGetCompanyInfo();
        document.title = "PF Report - Calculate Salary";
    }, []);

    useEffect(() => {
        handleGetAllEmployees();
    }, [filter]);

    const columns = [
        {
            field: 'rowId', headerName: '#', headerClassName: 'uppercase', flex: 1, maxWidth: 100,
            sortable: false,
            renderCell: (params) =>
                params.row.isTotalRow ? null : <span>{params.value}</span>
        },
        {
            field: 'userName', headerName: 'Employee Name', headerClassName: 'uppercase', flex: 1, minWidth: 300,
            sortable: false,
            renderCell: (params) => params.row.isTotalRow ? <strong className='font-semibold'>Total</strong> : params.value
        },
        // {
        //     field: 'basic_salary',
        //     headerName: 'Basic Salary(Monthly)',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 300,
        //     sortable: false,
        //     align: "right",
        //     headerAlign: "right",
        //     renderCell: (params) => params.row.isTotalRow ? null : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        // },
        // {
        //     field: 'totalDays',
        //     headerName: 'Total Days',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 300,
        //     align: "right",
        //     sortable: false,
        //     headerAlign: "right",
        // },
        // {
        //     field: 'daysWorked',
        //     headerName: 'Working Days',
        //     headerClassName: 'uppercase',
        //     flex: 1,
        //     maxWidth: 300,
        //     align: "right",
        //     sortable: false,
        //     headerAlign: "right",
        // },
        {
            field: 'employee_pf_amount',
            headerName: 'Employee PF',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 300,
            align: "right",
            sortable: false,
            headerAlign: "right",
            renderCell: (params) => params.row.isTotalRow ? null : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        },
        {
            field: 'employer_pf_amount',
            headerName: 'Employer PF',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 300,
            align: "right",
            sortable: false,
            headerAlign: "right",
            renderCell: (params) => params.row.isTotalRow ? null : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        },
        {
            field: 'total_amount',
            headerName: 'Total PF',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            align: "right",
            sortable: false,
            headerAlign: "right",
            renderCell: (params) =>
                params.row.isTotalRow
                    ? <strong className='font-semibold'>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</strong>
                    : <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
        }
    ];

    const generatePDF = async () => {
        setShowPdfContent(true);
        setLoadingPdf(true);

        setTimeout(async () => {
            const pdf = new jsPDF("p", "mm", "a4");
            const margin = 10;
            const imgWidth = 210 - 2 * margin;
            let yOffset = margin;

            const salarySlipElements = document.querySelectorAll("#PF-table-container");

            for (let i = 0; i < salarySlipElements.length; i++) {
                const element = salarySlipElements[i];

                // Force display in case it's hidden
                element.style.display = "block";

                const canvas = await html2canvas(element, {
                    scale: 1.5,
                    useCORS: true,
                    backgroundColor: "#fff",
                    // width: 794,
                    windowWidth: 794,
                });

                const imgData = canvas.toDataURL("image/jpeg", 0.8);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) {
                    pdf.addPage();
                    yOffset = margin;
                }

                pdf.addImage(imgData, "JPEG", margin, yOffset, imgWidth, imgHeight);
            }

            pdf.save("employee_pf_report.pdf");

            setShowPdfContent(false);
            setLoadingPdf(false);
        }, 700);
    };

    const getRowId = (row) => row.rowId ?? row.id;

    const actionButtons = () => {
        return (
            <div className='flex justify-start items-center gap-3'>
                {/* <Button type={`button`} text={'Generate report'} isLoading={loadingPdf} onClick={() => handleGetAllEmployees()} startIcon={<CustomIcons iconName="fa-solid fa-file" css="h-5 w-5" />} /> */}
                <Button type={`button`} useFor={'error'} text={'Download PDF'} isLoading={loadingPdf} onClick={() => generatePDF()} startIcon={<CustomIcons iconName="fa-solid fa-file-pdf" css="h-5 w-5" />} />
            </div>
        )
    }

    return (
        <div className='px-3 lg:px-0'>
            <div className="my-3 w-60">
                <Select
                    options={filterOptionsByMonth}
                    label={"Filter by Duration"}
                    placeholder="Select Duration"
                    value={filter + 1}
                    onChange={(_, newValue) => {
                        setFilter(newValue?.value);
                    }}
                />
            </div>

            <div className='border rounded-lg bg-white lg:w-full'>
                <DataTable
                    columns={columns}
                    rows={employees}
                    getRowId={getRowId}
                    height={500}
                    showButtons={true}
                    buttons={actionButtons}
                />
            </div>

            {showPdfContent && (
                <div className='absolute top-0 left-0 z-[-1] w-[180vh] opacity-0'>
                    <PFPDFTable data={employees} companyInfo={companyInfo} period={filterOptionsByMonth?.find(option => option?.value === filter)?.title} />
                </div>
            )}
        </div>
    );
};

export default PFReport;
