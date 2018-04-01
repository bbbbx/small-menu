$(document).ready(function() {
	let password = document.querySelector('#password');
	let passwordConfirm = document.querySelector('#passwordConfirm');
	let form = document.querySelector('#register');
	passwordConfirm.addEventListener('change', function() {
		if (passwordConfirm.value !== password.value) {
			passwordConfirm.focus();
			swal('两次密码不一致');
		}
	});
	form.addEventListener('submit', function() {
		console.log('form submit');
	});
});