// Tests for:

// -3.2.1.3.2 The system shall validate the password matches the confirm password field.
// -3.2.1.3.3 The system shall present an error message or a success message to the user in each case.
// -3.2.1.3.4 The system shall validate the strength of the password with the minimum requirements.

import { verifyRegistrationRequirements } from './signUp';

describe('3.2.1.3.2 - The system shall validate the password matches the confirm password field', () => {

  it('fail to register with unmatching passwords', () => {
    const username = 'test';
    const password = 'hello123';
    const confirmPassword = 'hello321';
  
    const err = verifyRegistrationRequirements(username, password, confirmPassword);
  
    expect(err).toEqual('Your passwords do not match, please try again.');
  });
  
  it('successfully register with matching passwords', () => {
    const username = 'test';
    const password = 'hello123';
    const confirmPassword = password;
  
    const err = verifyRegistrationRequirements(username, password, confirmPassword);
  
    expect(err).toBeNull();
  });

});

describe('3.2.1.3.3 The system shall present an error message or a success message to the user in each case.', () => {

  it('presents error message when signup parameters not matching requirements', () => {
    const username = '';
    const password = '';
    
    const err = verifyRegistrationRequirements(username, password, password);

    expect(err).toBeTruthy();
  });

});

describe('3.2.1.3.4 The system shall validate the strength of the password with the minimum requirements.', () => {

  it('prevents registration with password too small', () => {
    const username = 'test';
    const password = '12';

    const err = verifyRegistrationRequirements(username, password, password);

    expect(err).toEqual('Your password must be at least 3 characters long.')
  })

  it('prevents registration with empty password', () => {
    const username = 'test';
    const password = '';

    const err = verifyRegistrationRequirements(username, password, password);

    expect(err).toEqual('Password cannot be empty.')
  })

  it('allows registration with password matching minimum requirements', () => {
    const username = 'test';
    const password = 'test123';

    const err = verifyRegistrationRequirements(username, password, password);

    expect(err).toBeNull()
  })

});