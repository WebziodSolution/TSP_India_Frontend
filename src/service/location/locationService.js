import { locationURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllLocations = async () => {
    try {
        const response = axiosInterceptor().get(`${locationURL}/get/all`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getAllActiveLocationsByCompanyId = async (id) => {
    try {
        const response = axiosInterceptor().get(`${locationURL}/getActiveLocations/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getAllLocationsByCompanyId = async (id) => {
    try {
        const response = axiosInterceptor().get(`${locationURL}/getAllLocationByCompany/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getLocations = async (ids) => {
    try {
        const response = axiosInterceptor().get(`${locationURL}/getLocations?locationIds=${ids.join(',')}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getLocation = async (id) => {
    try {
        const response = axiosInterceptor().get(`${locationURL}/get/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createLocation = async (data) => {
    try {
        const response = axiosInterceptor().post(`${locationURL}/create`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateLocation = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${locationURL}/update/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteLocation = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${locationURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}