import { statementMasterURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllStatementMasters = async (id) => {
    try {
        const response = axiosInterceptor().get(`${statementMasterURL}/getAllStatementMasters/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getSalaryStatementMasterById = async (id) => {
    try {
        const response = axiosInterceptor().get(`${statementMasterURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}
