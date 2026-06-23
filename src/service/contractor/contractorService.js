import { contractorURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllContractor = async () => {
    try {
        const response = axiosInterceptor().get(`${contractorURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getContractor = async (id) => {
    try {
        const response = axiosInterceptor().get(`${contractorURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addContractor = async (data) => {
    try {
        const response = axiosInterceptor().post(`${contractorURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateContractor = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${contractorURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteContractor = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${contractorURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}