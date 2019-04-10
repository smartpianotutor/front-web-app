export function verifyRegistrationRequirements(username: string, password: string, confirmPassword: string): string {

    if (username == '') return "Username cannot be empty."
    if (username.length < 3) return "Your username must be at least 3 characters long."
    if (password == '') return "Password cannot be empty."
    if (password.length < 4) return "Your password must be at least 4 characters long."
    if (password.length > 10) return "Your password must be less than 10 characters long."
    if (!password.match(".*\\d+.*")) return "Your password must contain at least one number."
    if (!password.match("[a-zA-Z]")) return "Your password must contain at least one letter."
    if (password != confirmPassword) return "Your passwords do not match, please try again."

    return null;
}