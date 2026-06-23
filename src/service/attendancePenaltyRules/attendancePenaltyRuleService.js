import { attendancePenaltyRulesURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const findAllAttendancePenaltyRuleByCompanyId = async (type,companyId) => {
    try {
        const response = axiosInterceptor().get(`${attendancePenaltyRulesURL}/get/all/${type}/${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAttendancePenaltyRuleById = async (id) => {
    try {
        const response = axiosInterceptor().get(`${attendancePenaltyRulesURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createAttendancePenaltyRule = async (data) => {
    try {
        const response = axiosInterceptor().post(`${attendancePenaltyRulesURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateAttendancePenaltyRule = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${attendancePenaltyRulesURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteAttendancePenaltyRule = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${attendancePenaltyRulesURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}