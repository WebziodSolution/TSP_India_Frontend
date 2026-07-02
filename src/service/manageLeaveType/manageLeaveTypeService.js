import { leaveTypeURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllLeaveTypesByCompanyId = async (id) => {
    try {
        const response = axiosInterceptor().get(`${leaveTypeURL}/get/all/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getLeaveTypeById = async (id) => {
    try {
        const response = axiosInterceptor().get(`${leaveTypeURL}/get/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createLeaveType = async (data) => {
    try {
        const response = axiosInterceptor().post(`${leaveTypeURL}/create`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateLeaveType = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${leaveTypeURL}/update/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteLeaveType = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${leaveTypeURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}