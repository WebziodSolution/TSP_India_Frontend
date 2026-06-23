import { holidayTemplatesURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllHolidaysTemplates = async (id) => {
    try {
        const response = axiosInterceptor().get(`${holidayTemplatesURL}/get/all/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getHolidaysTemplate = async (id) => {
    try {
        const response = axiosInterceptor().get(`${holidayTemplatesURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createHolidaysTemplate = async (data) => {
    try {
        const response = axiosInterceptor().post(`${holidayTemplatesURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateHolidaysTemplate = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${holidayTemplatesURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteHolidaysTemplate = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${holidayTemplatesURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const assignHolidaysTemplate = async (data) => {
    try {
        const response = axiosInterceptor().post(`${holidayTemplatesURL}/assignEmployees`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}