import { employeeLeaveMasterURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllEmployeeLeaveMastersByCompanyId = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeLeaveMasterURL}/get/all/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getAllEmployeeLeaveMastersByEmployeeId = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeLeaveMasterURL}/get/employee/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getEmployeeLeaveMasterById = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeLeaveMasterURL}/get/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createEmployeeLeaveMaster = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employeeLeaveMasterURL}/create`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateEmployeeLeaveMaster = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${employeeLeaveMasterURL}/update/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteEmployeeLeaveMaster = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${employeeLeaveMasterURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}