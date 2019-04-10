// Tests for:

// -3.2.2.3.3 The system shall display the result of the validations for the user - either successfully logged in or unsuccessful login attempt.

import { verifySignInRequirements } from './login';

describe('3.2.2.3.3 The system shall display the result of the validations for the user - either successfully logged in or unsuccessful login attempt.', () => {
  
  it('presents error message when username is empty during login', () => {
    const username = '';
    const password = '123';
    
    const err = verifySignInRequirements(username, password);

    expect(err).toEqual('Username cannot be empty.');
  });

  it('presents error message when password is empty during login', () => {
    const username = '123';
    const password = '';
    
    const err = verifySignInRequirements(username, password);

    expect(err).toEqual('Password cannot be empty.');
  });

  it('presents no error message when login parameters are sufficient', () => {
    const username = '123';
    const password = '123';
    
    const err = verifySignInRequirements(username, password);

    expect(err).toBeNull();
  });

});