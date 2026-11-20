document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-label', visible ? 'Sembunyikan password' : 'Tampilkan password');
    button.setAttribute('aria-pressed', String(visible));
    button.querySelector('[data-eye-open]').hidden = visible;
    button.querySelector('[data-eye-off]').hidden = !visible;
  });
});
