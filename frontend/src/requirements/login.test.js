// Tests for:

// -3.2.1.3.2 The system shall validate the password matches the confirm password field.
// -3.2.1.3.3 The system shall present an error message or a success message to the user in each case.
// -3.2.1.3.4 The system shall validate the strength of the password with the minimum requirements.
// -3.2.2.3.3 The system shall display the result of the validations for the user - either successfully logged in or unsuccessful login attempt.

import { verifySignInRequirements, verifyRegistrationRequirements } from './login';

// 3.2.1.3.2
it('3.2.1.3.2 - fail to register with unmatching passwords', () => {
  const username = 'test';
  const password = 'hello123';
  const confirmPassword = 'hello321';

  const err = verifyRegistrationRequirements(username, password, confirmPassword);

  expect(err).toEqual('Your passwords do not match, please try again.');
});

it('3.2.1.3.2 - successfully register with matching passwords', () => {
  const username = 'test';
  const password = 'hello123';
  const confirmPassword = password;

  const err = verifyRegistrationRequirements(username, password, confirmPassword);

  expect(err).toBeNull();
});

// 3.2.1.3.3

