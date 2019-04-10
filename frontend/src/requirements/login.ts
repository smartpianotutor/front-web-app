// Implements the following:

// -3.2.2.3.3 The system shall display the result of the validations for the user - either successfully logged in or unsuccessful login attempt.

export function verifySignInRequirements(username: string, password: string): string {

    if (username == '') return "Username cannot be empty."
    if (password == '') return "Password cannot be empty."

    return null;
}