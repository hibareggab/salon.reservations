// Identifiants demandés : username = "Admin" (sensible à la casse), password = "123456789"
const VALID_USERNAME = "Admin";
const VALID_PASSWORD = "123456789";

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMsg');

  loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Marquer la session comme connectée (valide uniquement côté client)
      sessionStorage.setItem('salon_logged_in', 'true');
      // Redirection vers la page principale
      window.location.href = "index.html";
    } else {
      errorMsg.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة";
    }
  });

  // permettre Enter pour se connecter
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
});
