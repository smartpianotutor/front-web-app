import axios from 'axios';

const url = `localhost:5000/api`;

export function register(username: string, password: string) {
    return axios.post(`${url}/register`, {username, password});
}




