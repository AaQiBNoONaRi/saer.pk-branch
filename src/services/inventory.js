import api from './api';

export const inventoryAPI = {
    // Get all hotels
    getHotels: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.city) params.append('city', filters.city);
        if (filters.min_rating) params.append('min_rating', filters.min_rating);

        const response = await api.get(`/api/hotels/?${params.toString()}`);
        return response.data;
    },

    // Get all packages
    getPackages: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);

        const response = await api.get(`/api/packages/?${params.toString()}`);
        return response.data;
    },

    // Get all flights
    getFlights: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.airline) params.append('airline', filters.airline);
        if (filters.sector) params.append('sector', filters.sector);

        const response = await api.get(`/api/flights/?${params.toString()}`);
        return response.data;
    },

    // Get ticket inventory
    getTicketInventory: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.group_name) params.append('group_name', filters.group_name);
        if (filters.group_type) params.append('group_type', filters.group_type);
        if (filters.trip_type) params.append('trip_type', filters.trip_type);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);

        const response = await api.get(`/api/ticket-inventory/?${params.toString()}`);
        return response.data;
    },

    // Get airlines list (helper for filters)
    getAirlines: async () => {
        const response = await api.get('/api/others/flight-iata?is_active=true');
        return response.data;
    }
};
