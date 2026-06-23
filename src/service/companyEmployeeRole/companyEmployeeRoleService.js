import { employeeRoleURL,employeeRoleActionURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const getAllRoleActions = async () => {
    try {
        const response = axiosInterceptor().get(`${employeeRoleActionURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllCompanyRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeRoleURL}/getAllCompanyEmployeeRoles/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllEmployeeRoleList = async () => {
    try {
        const response = axiosInterceptor().get(`${employeeRoleURL}/rolesListPage`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getEmployeeRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeRoleURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllEmployeeActionsByRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeRoleURL}/getActions/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createEmployeeRole = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employeeRoleURL}/create`,data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateEmployeeRole = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${employeeRoleURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteEmployeeRole = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${employeeRoleURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}