
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
      container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
      container.classList.remove('right-panel-active');
    });

    // Demo login form logic
    document.getElementById('signInForm').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Signed in successfully!');
    });

    document.getElementById('signUpForm').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Account created successfully!');
    });
  
