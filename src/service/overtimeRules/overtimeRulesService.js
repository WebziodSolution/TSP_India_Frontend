import { overtimeRulesURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllOvertimeRules = async (id) => {
    try {
        const response = axiosInterceptor().get(`${overtimeRulesURL}/getAllOvertimeRules/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getOvertimeRule = async (id) => {
    try {
        const response = axiosInterceptor().get(`${overtimeRulesURL}/getOvertimeRule/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createOvertimeRule = async (id, data) => {
    try {
        const response = axiosInterceptor().post(`${overtimeRulesURL}/createOvertimeRule/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }

}

export const updateOvertimeRule = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${overtimeRulesURL}/updateOvertimeRule/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteOvertimeRule = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${overtimeRulesURL}/deleteOvertimeRule/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}