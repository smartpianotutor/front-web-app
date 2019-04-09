export function verifyRegistrationRequirements(username: string, password: string, confirmPassword: string): string {

    if (username == '') return "Username cannot be empty."
    if (username.length < 3) return "Your username must be at least 3 characters long."
    if (password == '') return "Password cannot be empty."
    if (password.length < 3) return "Your password must be at least 3 characters long."
    if (password != confirmPassword) return "Your passwords do not match, please try again."

    return null;
}

export function verifySignInRequirements(username: string, password: string): string {

    if (username == '') return "Username cannot be empty."
    if (password == '') return "Password cannot be empty."

    return null;
}