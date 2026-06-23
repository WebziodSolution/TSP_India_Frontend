import { departmentURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllDepartment = async (id) => {
    try {
        const response = axiosInterceptor().get(`${departmentURL}/get/all/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getDepartment = async (id) => {
    try {
        const response = axiosInterceptor().get(`${departmentURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createDepartment = async (data) => {
    try {
        const response = axiosInterceptor().post(`${departmentURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateDepartment = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${departmentURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteDepartment = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${departmentURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}