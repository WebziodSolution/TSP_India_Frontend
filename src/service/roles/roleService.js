import { rolesURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllRoles = async () => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/getAllRoleList`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllRoleList = async () => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/rolesListPage`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllActionsByRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/getActions/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createRole = async (data) => {
    try {
        const response = axiosInterceptor().post(`${rolesURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateRole = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${rolesURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteRole = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${rolesURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}