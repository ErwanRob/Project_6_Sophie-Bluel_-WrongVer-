async function loginUser(email, password) {
    try {
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.status === 200) {
        const data = await response.json();
        const { userId, token } = data;
        // Store the token in local storage or a cookie for future use
        localStorage.setItem('token', token);
        // Perform actions after successful login (example : redirect to another page)
        //-->
        window.location.href="index.html"
        console.log('Connected')  
        console.log(data)
      
      } else if (response.status === 401) {
        console.log('Invalid email or password');
      } else if (response.status === 404) {
        console.log('User not found');
      } else {
        console.log('Unexpected error occurred');
      }
    } catch (error) {
      console.log('An error occurred:', error);
    }
  }
  
  const loginForm = document.querySelector('#login form');
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#pass');
    const email = emailInput.value;
    const password = passwordInput.value;
    loginUser(email, password);
  });








