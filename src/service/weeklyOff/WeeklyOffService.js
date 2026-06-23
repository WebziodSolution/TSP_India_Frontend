import { weeklyOffURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const getAllWeekOffTemplate = async (companyId) => {
    try {
        const response = axiosInterceptor().get(`${weeklyOffURL}/get/all/${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getWeekOffTemplate = async (id) => {
    try {
        const response = axiosInterceptor().get(`${weeklyOffURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createWeekOffTemplate = async (data) => {
    try {
        const response = axiosInterceptor().post(`${weeklyOffURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateWeekOffTemplate = async (id,data) => {
    try {
        const response = axiosInterceptor().patch(`${weeklyOffURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteWeekOffTemplate = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${weeklyOffURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const assignEmployees = async (data) => {
    try {
        const response = axiosInterceptor().post(`${weeklyOffURL}/assignEmployees`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const assignDefaultTemplate = async (id) => {
    try {
        const response = axiosInterceptor().get(`${weeklyOffURL}/assignDefaultTemplate/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}
