import { employeeSalaryStatementURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const getEmployeeSalaryStatements = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employeeSalaryStatementURL}/getEmployeeSalaryStatements`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}