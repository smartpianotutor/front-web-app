import axios from 'axios';

const url = `http://localhost:5000/`;

export function register(username: string, password: string) {
    const data = new FormData();

    data.append('username', username);
    data.append('password', password);

    return axios.post(`${url}auth/register`, data);
}

export function signIn(username: string, password: string) {
    const data = new FormData();

    data.append('username', username);
    data.append('password', password);

    return axios.post(`${url}auth/login`, data);
}




