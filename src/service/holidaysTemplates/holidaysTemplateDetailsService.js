import { holidayTemplateDetailsURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllHolidaysTemplatesDetails = async (id) => {
    try {
        const response = axiosInterceptor().get(`${holidayTemplateDetailsURL}/get/all/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getHolidaysTemplateDetails = async (id) => {
    try {
        const response = axiosInterceptor().get(`${holidayTemplateDetailsURL}/get/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createHolidaysTemplateDetails = async (data) => {
    try {
        const response = axiosInterceptor().post(`${holidayTemplateDetailsURL}/create`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateHolidaysTemplateDetails = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${holidayTemplateDetailsURL}/update/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteHolidaysTemplateDetails = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${holidayTemplateDetailsURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}