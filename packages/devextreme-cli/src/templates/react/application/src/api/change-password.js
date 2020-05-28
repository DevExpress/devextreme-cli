export default function(email, recoveryCode) {
  try {
    // Send request
    console.log(email, recoveryCode);

    return {
      isOk: true
    }
  }
  catch {
    return {
      isOk: false,
      message: "Failed to change password"
    }
  }
}
