export default function(email) {
  try {
    // Send request
    console.log(email);

    return {
      isOk: true
    }
  }
  catch {
    return {
      isOk: false,
      message: "Failed to reset password"
    }
  }
}
