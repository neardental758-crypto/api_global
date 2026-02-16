const admin = require('firebase-admin');

const serviceAccount = {
  type: "service_account",
  project_id: "ridebc-d6e1b",
  private_key_id: "06722270c87a5275d7d32ea9bb42332caa8fda4e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZfvGAeHG3QPvp\nDOH751+28x/YJRrltqF17Unm1oMokWBCLCZIIiLNCWT43KsISAnzQ9ShfrgXM1s1\n/8pV/X07BGd6tKg+GQ8tRoSJRdh4j69zxcfUMnLPcrsJR4SCinEytAd+HX9s+CAo\nmtR7pdx35Ail+UuW/rmNPptTmqf/VrYsWycXtg++Gj/xgdolFxz3QFzDfE58mNFc\neHAyLCDcXeZgnK6kSkNuQtEwqOSJLZNN5l0yPB7oH+QSWMvuJczdNZRQ1v1YZ+Tr\nxriZMlGksI5JJAlcIwgZWS8frB2UZWfOrCMO7jQOihTFkKE2NcsEJi6Rsnwnggz7\neJ7ug9/5AgMBAAECggEAHHxfVgOwZR96PuZEjNEbfKMwJweJE9ANKpxXAwhSalRM\nBq6wnt71ruQNmPiR4AZLY1Sdez9VDhjYV+S2E/gc2Ed15CDYLjXrAnOLdU00EmpD\nQQcE6ppm5huxOoBm7xABznG8z3w+jb+buqW4sa8iBoPTzCUwDMk09TZfcp49ZZgw\nVHHAsjjBV0KP0MSJl0S61+PqlvLgFLX9JyMFbNxnJ57mCDfwICVmWyMTluwGsOZm\n0LVTRXLVi6j2n1wYrdKDCR9H7Qqt8VsfiFhB3i9xFAdZdL91BBewGZdqYQZE1mVT\n8dJDGlCZTOwPG1dOSDyLxJUJYjx5WSsXEfxkxwM4ZwKBgQD8r5F5NaRfkWRbePba\n0XuGaXocGD8fZ+rPT0xl/fgvM1tYHZqpZwRPWZsQTtx2nB7oOYMPaG6TBSlYj4Hd\npcd9X4rfwvJMxQ38R3H2hp9oOeUXc7Q8109Z6uaUpw7JbyTaYHkrTR1eRJQIMtp8\n4bvxkjbsOWRXYlSmHD5P6EYFtwKBgQDcWTgs6DbkgGbD7+97Gs/h31ZObA52ctlY\n6XtMC53dpasECS3DUweTOVd1bPjOHN0MbI9x6acK/9zm+URL8xBtecAWkDs9y1hU\n1POZELr8/3kPIWcY3lbrB8O+BiDQmVMnJG/Ass7VWxeWCbbp5vcF+/+xjY+5vXwD\nNeoK7CzHzwKBgQDcwOl/kkybLWMWwvQusQqQn/+NIeWro1axbJ7bD+jOG7j2n05q\nJtTOGgNtWOgkOzqJOQ113Y+Uo9K+SwlywY0py9mAqUiTpygTubsnW+9R2Bp7xZq1\n+IibjquJPPWfJ5lzqwrQuJsqqxEEpKDarz9Jyapv76fo67/2KwCJQOxDuwKBgQCM\nEbr/8O1T+7tXumIFY1naP1php5bZ/M/lESZrhMbparJ3ck5A57rc/4p0/rx6aSar\nCyd0Rg8Fkvgdaz7a+Lvsm4Rb03uVIHoaEvR2zIfQ46VU1OrwiAXAicMIPGUHtS+C\npkrTt9Z7EdjAa5R2w3crurEjcNV4QNdgQxlvsAoXSQKBgAwlVMgoHUqgoyPo1YIp\nTxer0hkGzDnm9I8g4M+af8kkOmT63COthcmVf+JhWxscelDIcTC6D+QbkuLIuv3J\npbOdhyTfyDBZSNR2NRT47xP1nxWEn1MBwEkZPxBDwec5EhRElAeezN1O2E93CDTz\nZE33rqLE6lqK1kd5wnp6yOnQ\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-rglay@ridebc-d6e1b.iam.gserviceaccount.com",
  client_id: "100089172840421039027",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-rglay%40ridebc-d6e1b.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

let firebaseApp;

try {
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'ridebc-d6e1b'
    });
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('Error inicializando Firebase Admin:', error);
  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
  }
}

module.exports = firebaseApp || admin;