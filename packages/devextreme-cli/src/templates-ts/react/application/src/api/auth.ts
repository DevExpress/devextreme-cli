import defaultUser from '../utils/default-user';

export async function signIn(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // Send request
    console.log(email, password);

    return {
      isOk: true,
      data: defaultUser
    };
  }
  catch {
    return {
      isOk: false,
      message: "Authentication failed"
    };
  }
}

export async function getUser() {
  try {
    // Send request

    return {
      isOk: true,
      data: defaultUser
    };
  }
  catch {
    return {
      isOk: false
    };
  }
}

export async function createAccount(email<%=#isTypeScript%>: string<%=/isTypeScript%>, password<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // Send request
    console.log(email, password);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to create account"
    };
  }
}

export async function changePassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>, recoveryCode<%=#isTypeScript%>: string | undefined<%=/isTypeScript%>) {
  try {
    // Send request
    console.log(email, recoveryCode);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to change password"
    }
  }
}

export async function resetPassword(email<%=#isTypeScript%>: string<%=/isTypeScript%>) {
  try {
    // Send request
    console.log(email);

    return {
      isOk: true
    };
  }
  catch {
    return {
      isOk: false,
      message: "Failed to reset password"
    };
  }
}
