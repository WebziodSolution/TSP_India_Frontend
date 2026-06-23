import { userURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllUsers = async () => {
    try {
        const response = axiosInterceptor().get(`${userURL}/getAllUsers`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getUser = async (id) => {
    try {
        const response = axiosInterceptor().get(`${userURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createUser = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateUser = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${userURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteUser = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${userURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const generateResetPasswordLink = async (email, userName, companyId) => {
    try {
        const response = axiosInterceptor().get(`${userURL}/generateResetLink?email=${email}&userName=${userName}&companyId=${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const resetPassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userURL}/resetPassword`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const checkValidToken = async (token) => {
    try {
        const response = axiosInterceptor().get(`${userURL}/validateToken?token=${token}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const uploadProfileImage = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userURL}/uploadProfileImage`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteProfileImage = async () => {
    try {
        const response = axiosInterceptor().get(`${userURL}/deleteProfileImage`)
        return response

    } catch (error) {
        console.log(error)
    }
}