import axios from 'axios';

export function register(username: string, password: string) {
    const data = new FormData();

    data.append('username', username);
    data.append('password', password);

    return axios.post(`auth/register`, data);
}

export function signIn(username: string, password: string) {
    const data = new FormData();

    data.append('username', username);
    data.append('password', password);

    return axios.post(`auth/login`, data);
}




