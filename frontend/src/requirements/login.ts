export function verifySignInRequirements(username: string, password: string): string {

    if (username == '') return "Username cannot be empty."
    if (password == '') return "Password cannot be empty."

    return null;
}